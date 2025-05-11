from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
from sklearn.manifold import MDS
import traceback
import json

app = Flask(__name__)
CORS(app)

# Load and preprocess data
data_path = "C:\\Users\\samritkar\\OneDrive - Stony Brook University\\Desktop\\Viz final project\\viz-final-project-main\\Affordable_Housing_Production_by_Building_20250226.csv" # Update with your file path
df = pd.read_csv(data_path)

# Define numeric and categorical columns
num_cols = [
    
    "Studio Units", "1-BR Units", "2-BR Units", "3-BR Units", "4-BR Units",
    "5-BR Units", "6-BR+ Units", "Counted Rental Units", "Total Units"
]

categorical_cols = [
    "Borough", "Construction Type"
    ]

# Prepare complete data versions (for PCP and geo-map)
num_data = df[num_cols].dropna()
cat_data = df[categorical_cols].fillna('Unknown')
all_data = df.copy()  # For endpoints returning full records

# Standardize numeric data and compute PCA
data = df[num_cols].dropna()
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data)

pca = PCA()
pca.fit(data_scaled)
eigenvalues = pca.explained_variance_
cumulative_variance = np.cumsum(pca.explained_variance_ratio_)
eigenvectors = pca.components_
pca_transformed = pca.transform(data_scaled)

# KMeans for cluster assignments on full data
k_range = range(2, 11)  # clusters from 2 to 10
kmeans_results = {}
inertias = []
mse_values = []

def compute_kmeans(data_in):
    results = {}
    inertias_local = []
    mse_local = []
    for k in k_range:
        try:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(data_in)
            results[k] = kmeans.labels_
            inertias_local.append(kmeans.inertia_)
            preds = kmeans.predict(data_in)
            mse_val = mean_squared_error(data_in, kmeans.cluster_centers_[preds])
            mse_local.append(mse_val)
        except Exception as e:
            app.logger.error(f"Error for k={k}: {e}")
    return results, inertias_local, mse_local

kmeans_results, inertias, mse_values = compute_kmeans(data_scaled)

def find_elbow_point(inertias):
    angles = []
    for i in range(1, len(inertias)-1):
        p1 = np.array([i-1, inertias[i-1]])
        p2 = np.array([i, inertias[i]])
        p3 = np.array([i+1, inertias[i+1]])
        v1 = p2 - p1
        v2 = p3 - p2
        angle = np.abs(np.arctan2(np.cross(v1, v2), np.dot(v1, v2)))
        angles.append(angle)
    return np.argmax(angles) + 2

# Set a default k from the elbow method (within k_range)
optimal_k = find_elbow_point(inertias)
if optimal_k < 2:
    optimal_k = 3

# Endpoint: PCA data (Scree Plot)
@app.route('/pca', methods=['GET'])
def get_pca():
    try:
        return jsonify({
            "eigenvalues": eigenvalues.tolist(),
            "cumulative_variance": cumulative_variance.tolist(),
            "eigenvectors": eigenvectors.tolist()
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# Endpoint: Top PCA attributes for the first N components
@app.route('/top_pca_attributes', methods=['GET'])
def get_top_pca_attributes():
    try:
        dim_index = int(request.args.get("dim_index", 2))
        if dim_index < 1 or dim_index > len(pca.components_):
            return jsonify({"error": "Invalid dimensionality index."}), 400
            
        loadings = np.abs(pca.components_[:dim_index, :])
        sum_sq_loadings = np.sum(loadings**2, axis=0)
        top_features_idx = np.argsort(sum_sq_loadings)[-4:][::-1]
        top_features = [num_cols[i] for i in top_features_idx]
        
        return jsonify({
            "top_features": top_features,
            "feature_importances": {num_cols[i]: float(sum_sq_loadings[i]) for i in top_features_idx}
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# Endpoint: KMeans Elbow Curve in a given PCA subspace
@app.route('/kmeans_elbow', methods=['GET'])
def get_kmeans_elbow():
    try:
        dim = int(request.args.get('dim', len(pca.components_)))
        reduced_data = pca_transformed[:, :dim]
        results, inertias_local, mse_local = compute_kmeans(reduced_data)
        optimal_k_local = find_elbow_point(inertias_local)
        
        return jsonify({
            "k_values": list(k_range),
            "inertias": [float(val) for val in inertias_local],
            "optimal_k": int(optimal_k_local),
            "mse_values": [float(val) for val in mse_local]
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


# Endpoint: Full Parallel Coordinates and Geo-map Data
@app.route('/full_pcp_data', methods=['GET'])
def get_full_pcp_data():
    try:
        axis_order = request.args.get('axis_order')
        k = int(request.args.get('k', optimal_k))
        
        items = []
        for i in range(len(num_data)):
            row = {col: float(num_data.iloc[i][col]) for col in num_cols}
            for col in categorical_cols:
                row[col] = str(df.iloc[i][col]) if col in df.columns else "Unknown"
            if k in kmeans_results:
                row["cluster"] = int(kmeans_results[k][i])
            else:
                row["cluster"] = 0
            items.append(row)
            
        all_dims = categorical_cols + num_cols
        dimensions = json.loads(axis_order) if axis_order else all_dims
        
        values = {}
        for col in num_cols:
            values[col] = num_data[col].tolist()
        for col in categorical_cols:
            values[col] = df[col].fillna('Unknown').tolist() if col in df.columns else ["Unknown"] * len(num_data)
            
        return jsonify({
            "items": items,
            "dimensions": dimensions,
            "values": values,
            "categorical_dims": categorical_cols,
            "numerical_dims": num_cols
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route('/sankey_data', methods=['GET'])
def get_sankey_data():
    try:
        # Define the categories we want to show
        incomeCategories = [
            "Extremely Low Income Units",
            "Very Low Income Units",
            "Low Income Units",
            "Moderate Income Units",
            "Middle Income Units",
            "Other Income Units"
        ]
        constructionTypes=[
            "Preserved",
            "New Construction"

        ]
        # Get unique boroughs and construction types
        boroughs = df["Borough"].fillna("Unknown").unique().tolist()
        constructionTypes = df["Construction Type"].fillna("Unknown").unique().tolist()
        
        # Build nodes: first boroughs, then construction types, then income categories
        nodes = []
        # Add borough nodes
        for b in boroughs:
            nodes.append({"name": b})
        
        # Add construction type nodes
        for ct in constructionTypes:
            nodes.append({"name": ct})
            
        # Add income category nodes
        for ic in incomeCategories:
            nodes.append({"name": ic})
        
        # Create dictionary to track node indices
        nodeIndex = {}
        boroughOffset = 0
        constructionOffset = len(boroughs)
        incomeOffset = constructionOffset + len(constructionTypes)
        
        for i, b in enumerate(boroughs):
            nodeIndex[b] = i
        for j, ct in enumerate(constructionTypes):
            nodeIndex[ct] = constructionOffset + j
        for k, ic in enumerate(incomeCategories):
            nodeIndex[ic] = incomeOffset + k
        
        # Create links: Borough to Construction Type
        links = []
        for b in boroughs:
            for ct in constructionTypes:
                subset = df[(df["Borough"].fillna("Unknown") == b) & 
                           (df["Construction Type"].fillna("Unknown") == ct)]
                if len(subset) > 0:
                    total_units = subset[incomeCategories].sum().sum()
                    if total_units > 0:
                        links.append({
                            "source": nodeIndex[b],
                            "target": nodeIndex[ct],
                            "value": float(total_units)
                        })
        
        # Create links: Construction Type to Income Categories
        for ct in constructionTypes:
            subset = df[df["Construction Type"].fillna("Unknown") == ct]
            for ic in incomeCategories:
                val = subset[ic].fillna(0).sum()
                if val > 0:
                    links.append({
                        "source": nodeIndex[ct],
                        "target": nodeIndex[ic],
                        "value": float(val)
                    })
        
        return jsonify({"nodes": nodes, "links": links})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# # Endpoint: Sankey Diagram Data
# @app.route('/sankey_data', methods=['GET'])
# def get_sankey_data():
#     try:
#         # Aggregate flows from Borough (source) to each Income Category (target)
#         incomeCategories = [
#             "Extremely Low Income Units",
#             "Very Low Income Units",
#             "Low Income Units",
#             "Moderate Income Units",
#             "Middle Income Units",
#             "Other Income Units"
#         ]
        
#         # Get unique boroughs
#         boroughs = df["Borough"].fillna("Unknown").unique().tolist()
        
#         # Build nodes: first all boroughs, then income categories
#         nodes = [{"name": b} for b in boroughs] + [{"name": ic} for ic in incomeCategories]
        
#         # Create dictionary to track node indices
#         nodeIndex = {}
#         boroughOffset = 0
#         incomeOffset = len(boroughs)
        
#         for i, b in enumerate(boroughs):
#             nodeIndex[b] = i
#         for j, ic in enumerate(incomeCategories):
#             nodeIndex[ic] = incomeOffset + j
            
#         # Aggregate links: for each borough, sum up each income category column
#         links = []
#         for b in boroughs:
#             subset = df[df["Borough"].fillna("Unknown") == b]
#             for ic in incomeCategories:
#                 val = subset[ic].fillna(0).sum()
#                 # Only add link if value > 0
#                 if val > 0:
#                     links.append({
#                         "source": nodeIndex[b],
#                         "target": nodeIndex[ic],
#                         "value": float(val)
#                     })
                    
#         return jsonify({"nodes": nodes, "links": links})
#     except Exception as e:
#         return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route('/borough_units', methods=['GET'])
def get_borough_units():
    try:
        # Get year parameter from query string, default to all years
        year = request.args.get('year')
        
        # Create a filtered dataframe based on year if provided
        filtered_df = df
        if year:
            # Convert year to integer and filter by the Project Start Date
            year = int(year)
            # Assuming the date column is in format MM/DD/YYYY
            filtered_df = df[df['Project Start Date'].str.contains(f'/{year}$', na=False)]
        
        # Group by borough and sum units
        borough_data = filtered_df.groupby('Borough').agg({
            'Total Units': 'sum',
            'Extremely Low Income Units': 'sum',
            'Very Low Income Units': 'sum',
            'Low Income Units': 'sum',
            'Moderate Income Units': 'sum',
            'Middle Income Units': 'sum',
            'Other Income Units': 'sum'
        }).reset_index()
        
        return jsonify(borough_data.to_dict(orient='records'))
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# Endpoint: Pie chart data with year filter
@app.route('/pie_data', methods=['GET'])
def get_pie_data():
    try:
        # Get year parameter from query string, default to all years
        year = request.args.get('year')
        
        # Create a filtered dataframe based on year if provided
        filtered_df = df
        if year:
            # Convert year to integer and filter by the Project Start Date
            year = int(year)
            # Assuming the date column is in format MM/DD/YYYY
            filtered_df = df[df['Project Start Date'].str.contains(f'/{year}$', na=False)]
        
        # Construction type distribution
        construction_data = filtered_df['Construction Type'].fillna('Unknown').value_counts().reset_index()
        construction_data.columns = ['type', 'count']
        
        # Borough distribution
        borough_data = filtered_df['Borough'].fillna('Unknown').value_counts().reset_index()
        borough_data.columns = ['borough', 'count']
        
        return jsonify({
            "construction": construction_data.to_dict(orient='records'),
            "borough": borough_data.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


# @app.route('/stacked_income', methods=['GET'])
# def stacked_income():
#     # group by borough and income bands
#     df2 = df.fillna(0)
#     income_cols = [
#        "Extremely Low Income Units","Very Low Income Units","Low Income Units",
#        "Moderate Income Units","Middle Income Units","Other Income Units"
#     ]
#     grp = (df2
#         .groupby("Borough")[income_cols]
#         .sum()
#         .reset_index()
#     )
#     # convert to long format
#     records = []
#     for _, row in grp.iterrows():
#         b = row["Borough"]
#         for col in income_cols:
#             records.append({
#               "borough": b,
#               "category": col.replace(" Income Units",""),
#               "value": int(row[col])
#             })
#     return jsonify(records)

@app.route('/sunburst_years', methods=['GET'])
def get_sunburst_years():
    # Extract year from Project Start Date (MM/DD/YYYY)
    df_year = df.copy()
    df_year['Year'] = df_year['Project Start Date'].str.extract(r'/(\d{4})$')[0]
    
    # Sum Total Units by Year → Borough
    grp = (
        df_year
        .groupby(['Year','Borough'])
        .agg({'Total Units':'sum'})
        .reset_index()
    )
    
    # Build hierarchical JSON: Year → Borough → value
    root = {'name':'All Years','children':[]}
    for year, sub in grp.groupby('Year'):
        node = {'name': year, 'children': []}
        for _, row in sub.iterrows():
            node['children'].append({
                'name': row['Borough'],
                'value': int(row['Total Units'])
            })
        root['children'].append(node)
    
    return jsonify(root)


@app.route('/geo_data', methods=['GET'])
def get_geo_data():
    try:
        # Get year parameter from query string
        year = request.args.get('year')
        
        # Filter for buildings with valid coordinates
        geo_data = df[df['Latitude'].notna() & df['Longitude'].notna()].copy()
        
        # Filter by year if provided
        if year:
            # Convert year to integer and filter by the Project Start Date
            year = int(year)
            # Assuming the date column is in format MM/DD/YYYY
            geo_data = geo_data[geo_data['Project Start Date'].str.contains(f'/{year}$', na=False)]
        
        # Select relevant columns for the geo map visualization
        result = geo_data[['Project Name', 'Latitude', 'Longitude', 'Borough', 'Total Units',
                          'Construction Type', 'Extremely Low Income Units', 
                          'Very Low Income Units', 'Low Income Units', 'Moderate Income Units', 
                          'Middle Income Units', 'Other Income Units']].fillna('Unknown')
        
        # Convert to records format
        records = result.to_dict(orient='records')
        
        # Return as JSON
        return jsonify(records)
    except Exception as e:
        app.logger.error(f"Error in geo_data endpoint: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500



@app.route('/sunburst_data', methods=['GET'])
def get_sunburst_data():
    # Build a hierarchy: Borough → Construction Type → sum(Total Units)
    filtered = df.copy()
    # (Optional: filter by year/project date as you do elsewhere)
    
    # Group
    grp = (filtered
           .groupby(['Borough','Construction Type'])
           .agg({'Total Units':'sum'})
           .reset_index())
    
    # Nest into dict
    root = {'name':'NYC','children':[]}
    for borough, g1 in grp.groupby('Borough'):
        node = {'name':borough,'children':[]}
        for _, row in g1.iterrows():
            node['children'].append({
                'name': row['Construction Type'],
                'value': int(row['Total Units'])
            })
        root['children'].append(node)
    return jsonify(root)




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)