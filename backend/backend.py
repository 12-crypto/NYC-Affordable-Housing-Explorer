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
data_path = "/Users/dhruvrathee/Desktop/lab2b/Affordable_Housing_Production_by_Building_20250226.csv" # Update with your file path
df = pd.read_csv(data_path)

# Define numeric and categorical columns
num_cols = [
    "Extremely Low Income Units", "Very Low Income Units", "Low Income Units",
    "Moderate Income Units", "Middle Income Units", "Other Income Units",
    "Studio Units", "1-BR Units", "2-BR Units", "3-BR Units", "4-BR Units",
    "5-BR Units", "6-BR+ Units", "Counted Rental Units", "Total Units", "Latitude", "Longitude"
]

categorical_cols = [
    "Borough", "Construction Type", "Extended Affordability Only", 
    "Prevailing Wage Status"
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

# Endpoint: PCA Biplot
@app.route('/biplot', methods=['GET'])
def get_biplot():
    try:
        pc1_idx = int(request.args.get('pc1', 0))
        pc2_idx = int(request.args.get('pc2', 1))
        k = int(request.args.get('k', optimal_k))
        dim = int(request.args.get('dim', len(pca.components_)))
        
        if pc1_idx < 0 or pc1_idx >= len(pca.components_) or pc2_idx < 0 or pc2_idx >= len(pca.components_):
            return jsonify({"error": "Invalid PCA indices."}), 400
            
        # Run KMeans on reduced PCA data for given dimension
        reduced_data = pca_transformed[:, :dim]
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(reduced_data)
        
        return jsonify({
            "points": {
                "x": pca_transformed[:, pc1_idx].tolist(),
                "y": pca_transformed[:, pc2_idx].tolist(),
                "clusters": cluster_labels.tolist()
            },
            "loadings": {
                "x": eigenvectors[pc1_idx, :dim].tolist(),
                "y": eigenvectors[pc2_idx, :dim].tolist()
            },
            "features": num_cols[:dim],
            "variance_explained": {
                "x": float(pca.explained_variance_ratio_[pc1_idx]),
                "y": float(pca.explained_variance_ratio_[pc2_idx])
            }
        })
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# Endpoint: Data MDS Plot
@app.route('/data_mds', methods=['GET'])
def get_data_mds():
    try:
        k = int(request.args.get('k', optimal_k))
        if k not in kmeans_results:
            return jsonify({"error": f"No clustering for k={k}"}), 400
            
        if len(data_scaled) > 1500:
            indices = np.random.choice(len(data_scaled), 1500, replace=False)
            subset = data_scaled[indices]
            clusters_subset = kmeans_results[k][indices]
        else:
            subset = data_scaled
            clusters_subset = kmeans_results[k]
            
        mds = MDS(n_components=2, random_state=42, dissimilarity='euclidean', n_jobs=-1, verbose=0)
        mds_data = mds.fit_transform(subset)
        
        return jsonify({
            "x": mds_data[:, 0].tolist(),
            "y": mds_data[:, 1].tolist(),
            "clusters": clusters_subset.tolist()
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

# Endpoint: Sankey Diagram Data
@app.route('/sankey_data', methods=['GET'])
def get_sankey_data():
    try:
        # Aggregate flows from Borough (source) to each Income Category (target)
        incomeCategories = [
            "Extremely Low Income Units",
            "Very Low Income Units",
            "Low Income Units",
            "Moderate Income Units",
            "Middle Income Units",
            "Other Income Units"
        ]
        
        # Get unique boroughs
        boroughs = df["Borough"].fillna("Unknown").unique().tolist()
        
        # Build nodes: first all boroughs, then income categories
        nodes = [{"name": b} for b in boroughs] + [{"name": ic} for ic in incomeCategories]
        
        # Create dictionary to track node indices
        nodeIndex = {}
        boroughOffset = 0
        incomeOffset = len(boroughs)
        
        for i, b in enumerate(boroughs):
            nodeIndex[b] = i
        for j, ic in enumerate(incomeCategories):
            nodeIndex[ic] = incomeOffset + j
            
        # Aggregate links: for each borough, sum up each income category column
        links = []
        for b in boroughs:
            subset = df[df["Borough"].fillna("Unknown") == b]
            for ic in incomeCategories:
                val = subset[ic].fillna(0).sum()
                # Only add link if value > 0
                if val > 0:
                    links.append({
                        "source": nodeIndex[b],
                        "target": nodeIndex[ic],
                        "value": float(val)
                    })
                    
        return jsonify({"nodes": nodes, "links": links})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# Endpoint: Bar chart data by borough
# @app.route('/borough_units', methods=['GET'])
# def get_borough_units():
#     try:
#         # Group by borough and sum units
#         borough_data = df.groupby('Borough').agg({
#             'Total Units': 'sum',
#             # 'Extremely Low Income Units': 'sum',
#             # 'Very Low Income Units': 'sum',
#             # 'Low Income Units': 'sum',
#             # 'Moderate Income Units': 'sum',
#             # 'Middle Income Units': 'sum',
#             # 'Other Income Units': 'sum'
#         }).reset_index()
        
#         return jsonify(borough_data.to_dict(orient='records'))
#     except Exception as e:
#         return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500
# Endpoint: Bar chart data by borough with year filter
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


# Endpoint: Geo map data
# Endpoint: Geo map data
# @app.route('/geo_data', methods=['GET'])
# def get_geo_data():
#     try:
#         # Filter for buildings with valid coordinates
#         geo_data = df[df['Latitude'].notna() & df['Longitude'].notna()].copy()
        
#         # Select relevant columns for the geo map visualization
#         result = geo_data[['Project Name', 'Latitude', 'Longitude', 'Borough', 'Total Units',
#                           'Construction Type', 'Extremely Low Income Units', 
#                           'Very Low Income Units', 'Low Income Units', 'Moderate Income Units', 
#                           'Middle Income Units', 'Other Income Units']].fillna('Unknown')
        
#         # Convert to records format
#         records = result.to_dict(orient='records')
        
#         # Return as JSON
#         return jsonify(records)
#     except Exception as e:
#         app.logger.error(f"Error in geo_data endpoint: {str(e)}")
#         app.logger.error(traceback.format_exc())
#         return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

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

# Endpoint: Radar chart data
@app.route('/radar_data', methods=['GET'])
def get_radar_data():
    try:
        # Calculate metrics by borough
        radar_data = df.groupby('Borough').agg({
            'Total Units': 'mean',
            'Extremely Low Income Units': 'mean',
            'Very Low Income Units': 'mean',
            'Low Income Units': 'mean',
            'Moderate Income Units': 'mean',
            'Middle Income Units': 'mean'
        }).reset_index()
        
        # Normalize values for radar chart
        for col in radar_data.columns:
            if col != 'Borough':
                max_val = radar_data[col].max()
                if max_val > 0:
                    radar_data[col] = radar_data[col] / max_val
        
        return jsonify(radar_data.to_dict(orient='records'))
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500



# Endpoint: Pie chart data
# @app.route('/pie_data', methods=['GET'])
# def get_pie_data():
#     try:
#         # Construction type distribution
#         construction_data = df['Construction Type'].fillna('Unknown').value_counts().reset_index()
#         construction_data.columns = ['type', 'count']
        
#         # Borough distribution
#         borough_data = df['Borough'].fillna('Unknown').value_counts().reset_index()
#         borough_data.columns = ['borough', 'count']
        
#         return jsonify({
#             "construction": construction_data.to_dict(orient='records'),
#             "borough": borough_data.to_dict(orient='records')
#         })
#     except Exception as e:
#         return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# Endpoint: Treemap Data
@app.route('/treemap_data', methods=['GET'])
def get_treemap_data():
    try:
        # Group by Borough and Construction Type, sum Total Units
        treemap_data = df.groupby(['Borough', 'Construction Type']).agg({
            'Total Units': 'sum',
            'Extremely Low Income Units': 'sum',
            'Very Low Income Units': 'sum',
            'Low Income Units': 'sum',
            'Moderate Income Units': 'sum',
            'Middle Income Units': 'sum',
            'Other Income Units': 'sum'
        }).reset_index()
        
        # Format data for treemap (hierarchical structure)
        result = []
        
        # Get total units for all boroughs for percentage calculation
        total_units = treemap_data['Total Units'].sum()
        
        # Create hierarchical structure
        for borough, borough_group in treemap_data.groupby('Borough'):
            borough_total = borough_group['Total Units'].sum()
            borough_data = {
                'name': borough,
                'value': float(borough_total),
                'percentage': round((borough_total / total_units) * 100, 2) if total_units > 0 else 0,
                'children': []
            }
            
            for _, row in borough_group.iterrows():
                construction_type = row['Construction Type']
                units = row['Total Units']
                
                # Skip if no units
                if units <= 0:
                    continue
                    
                # Add construction type as child
                borough_data['children'].append({
                    'name': construction_type,
                    'value': float(units),
                    'percentage': round((units / borough_total) * 100, 2) if borough_total > 0 else 0,
                    'incomeBreakdown': {
                        'Extremely Low': float(row['Extremely Low Income Units']),
                        'Very Low': float(row['Very Low Income Units']),
                        'Low': float(row['Low Income Units']),
                        'Moderate': float(row['Moderate Income Units']),
                        'Middle': float(row['Middle Income Units']),
                        'Other': float(row['Other Income Units'])
                    }
                })
            
            result.append(borough_data)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
