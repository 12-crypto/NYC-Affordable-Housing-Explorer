// let selectedDi = 2;
// let currentK=9;

// const tooltip = document.createElement("div");
// tooltip.className = "tooltip";
// document.body.appendChild(tooltip);

// function debounce(func, wait) {
//     let timeout;
//     return function executedFunction(...args) {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// }


// function isElementInViewport(el) {
//     const rect = el.getBoundingClientRect();
//     return (
//         rect.top >= 0 &&
//         rect.left >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//     );
// }

// let plotsLoaded = {
//     screePlot: false,
//     pcaAttributes: false,
//     scatterplotMatrix: false,
//     biplot: false,
//     dataMDS: false,
//     varMDS: false,
//     pcp: false,
//     fullPcp: false
//   };
  
//   function loadVisiblePlots() {
//     if (!plotsLoaded.screePlot && isElementInViewport(document.getElementById('scree-plot'))) {
//       plotScreePlot();
//       plotsLoaded.screePlot = true;
//     }
//     if (!plotsLoaded.pcaAttributes && isElementInViewport(document.getElementById('pca-attributes'))) {
//       updatePCATopAttributes();
//       plotsLoaded.pcaAttributes = true;
//     }
//     if (!plotsLoaded.scatterplotMatrix && isElementInViewport(document.getElementById('scatterplot-matrix'))) {
//       plotScatterPlotMatrix();
//       plotsLoaded.scatterplotMatrix = true;
//     }
//     if (!plotsLoaded.biplot && isElementInViewport(document.getElementById('biplot'))) {
//       plotBiplot();
//       plotsLoaded.biplot = true;
//     }
//     if (!plotsLoaded.dataMDS && isElementInViewport(document.getElementById('dataMDS'))) {
//       plotDataMDS(currentK);
//       plotsLoaded.dataMDS = true;
//     }
//     if (!plotsLoaded.varMDS && isElementInViewport(document.getElementById('varMDS'))) {
//       plotVarMDS();
//       plotsLoaded.varMDS = true;
//     }
//     // if (!plotsLoaded.pcp && isElementInViewport(document.getElementById('pcp'))) {
//     //   memoizedPlotPCP();
//     //   plotsLoaded.pcp = true;
//     // }
//     if (!plotsLoaded.fullPcp && isElementInViewport(document.getElementById('pcp-full'))) {
//       memoizedPlotFullPCP();
//       plotsLoaded.fullPcp = true;
//     }
//   }
  

// const debouncedLoadVisiblePlots = debounce(loadVisiblePlots, 200);

// // Replace the commented out scroll listener with this
// window.addEventListener('scroll', function() {
//     // Only check if plots need to be loaded, don't force reload
//     debouncedLoadVisiblePlots();
//   });
  
// window.addEventListener('resize', debouncedLoadVisiblePlots);

// document.addEventListener('DOMContentLoaded', loadVisiblePlots);
  

// function scrollToSection(sectionId) {
//     const section = document.getElementById(sectionId);
//     section.scrollIntoView({ behavior: 'smooth' });
// }

// function calculatePathLength(points) {
//     let length = 0;
//     for (let i = 1; i < points.length; i++) {
//         const dx = points[i][0] - points[i-1][0];
//         const dy = points[i][1] - points[i-1][1];
//         length += Math.sqrt(dx * dx + dy * dy);
//     }
//     return length;
// }
// function plotScreePlot() {
//     fetch('http://localhost:5001/pca')
//         .then(response => response.json())
//         .then(data => {
//             const eigenvalues = data.eigenvalues;
//             const cumulativeVariance = data.cumulative_variance;
//             const margin = { top: 50, right: 50, bottom: 50, left: 50 };
//             const width = 800 - margin.left - margin.right;
//             const height = 400 - margin.top - margin.bottom;

//             d3.select("#scree-plot").html("");

//             const svg = d3.select("#scree-plot")
//                 .append("svg")
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);

//             const xScale = d3.scaleBand()
//                 .range([0, width])
//                 .domain(eigenvalues.map((_, i) => `PC ${i + 1}`))
//                 .padding(0.2);

//             const yScale = d3.scaleLinear()
//                 .domain([0, d3.max(eigenvalues)])
//                 .range([height, 0]);

//             svg.append("g")
//                 .attr("transform", `translate(0,${height})`)
//                 .call(d3.axisBottom(xScale))
//                 .selectAll("text")
//                 .attr("transform", "translate(-10,0)rotate(-45)")
//                 .style("text-anchor", "end");

//             svg.append("g")
//                 .call(d3.axisLeft(yScale));

    
//             const tooltip = d3.select("body").append("div")
//                 .attr("class", "tooltip")
//                 .style("position", "absolute")
//                 .style("background", "lightgray")
//                 .style("padding", "5px")
//                 .style("border-radius", "5px")
//                 .style("display", "none");

//             svg.selectAll(".bar")
//                 .data(eigenvalues)
//                 .enter()
//                 .append("rect")
//                 .attr("class", "bar")
//                 .attr("x", (_, i) => xScale(`PC ${i + 1}`))
//                 .attr("y", d => yScale(d))
//                 .attr("width", xScale.bandwidth())
//                 .attr("height", d => height - yScale(d))
//                 .attr("fill", (_, i) => i === selectedDi - 1 ? "#e74c3c" : "#3498db")
//                 .on("mouseover", function (event, d) {
//                     tooltip.style("display", "block")
//                         .html(`Explained Variance: ${d.toFixed(2)}`)
//                         .style("left", (event.pageX + 10) + "px")
//                         .style("top", (event.pageY - 20) + "px");
//                 })
//                 .on("mousemove", function (event) {
//                     tooltip.style("left", (event.pageX + 10) + "px")
//                         .style("top", (event.pageY - 20) + "px");
//                 })
//                 .on("mouseout", function () {
//                     tooltip.style("display", "none");
//                 })
//                 .on("click", function (event, d) {
//                     const index = eigenvalues.indexOf(d);
//                     selectedDi = index + 1;
//                     document.getElementById("dim-index").innerText = selectedDi;
//                     svg.selectAll(".bar").attr("fill", (_, i) => i === index ? "#e74c3c" : "#3498db");

//                     plotElbowCurve(selectedDi);
//                     plotBiplot(selectedDi);
//                     plotScatterPlotMatrix(selectedDi);
//                 });

//             const cumulativeLine = d3.line()
//                 .x((_, i) => xScale(`PC ${i + 1}`) + xScale.bandwidth() / 2)
//                 .y(d => yScale(d * d3.max(eigenvalues)));

//             svg.append("path")
//                 .datum(cumulativeVariance)
//                 .attr("fill", "none")
//                 .attr("stroke", "#000")
//                 .attr("stroke-width", 2)
//                 .attr("d", cumulativeLine);

//             svg.selectAll(".dot")
//                 .data(cumulativeVariance)
//                 .enter()
//                 .append("circle")
//                 .attr("class", "dot")
//                 .attr("cx", (_, i) => xScale(`PC ${i + 1}`) + xScale.bandwidth() / 2)
//                 .attr("cy", d => yScale(d * d3.max(eigenvalues)))
//                 .attr("r", 4)
//                 .attr("fill", "red");

//             svg.append("text")
//                 .attr("x", width / 2)
//                 .attr("y", height + margin.bottom - 10)
//                 .attr("text-anchor", "middle")
//                 .text("Principal Components");

//             svg.append("text")
//                 .attr("transform", "rotate(-90)")
//                 .attr("x", -height / 2)
//                 .attr("y", -margin.left + 15)
//                 .attr("text-anchor", "middle")
//                 .text("Explained Variance");

//             document.getElementById("dim-index").innerText = selectedDi;
//         })
//         .catch(error => {
//             console.error("Error in plotScreePlot:", error);
//             d3.select("#scree-plot").html(`Error: ${error.message || "Failed to fetch PCA data from the server."}`);
//         });
// }





// function updatePCATopAttributes() {
//     const dimIndex = selectedDi || 2;
//     fetch(`http://localhost:5001/top_pca_attributes?dim_index=${dimIndex}`)
//         .then(res => {
//             if (!res.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return res.json();
//         })
//         .then(data => {
//             const tableBody = d3.select("#pca-attributes-table tbody");
//             tableBody.html("");

//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 tableBody.append("tr")
//                     .append("td")
//                     .attr("colspan", "3")
//                     .text("Error: No data found.");
//                 return;
//             }

//             data.top_features.forEach((feature, index) => {
//                 const row = tableBody.append("tr");
//                 row.append("td").text(index + 1);
//                 row.append("td").text(feature);
//                 row.append("td").text(data.feature_importances[feature].toFixed(4));
//             });
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             const tableBody = d3.select("#pca-attributes-table tbody");
//             tableBody.html("");
//             tableBody.append("tr")
//                 .append("td")
//                 .attr("colspan", "3")
//                 .text(`Error: ${error.message || "Failed to fetch attributes from the server."}`);
//         });
// }

// function plotScatterPlotMatrix() {
//     fetch(`http://localhost:5001/scatterplot_matrix?dim_index=${selectedDi}&k=${currentK}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 d3.select("#scatterplot-matrix").html("<p>Error: No data found.</p>");
//                 return;
//             }

//             const scatterContainer = d3.select("#scatterplot-matrix");
//             scatterContainer.html("");

//             const features = data.features;
//             const containerDiv = scatterContainer.append("div")
//                 .attr("class", "scatterplot-container")
//                 .style("width", "100%")
//                 .style("max-width", "900px")
//                 .style("margin", "0 auto");

//             containerDiv.append("h3")
//                 .text(`Scatterplot Matrix (DI: ${selectedDi})`)
//                 .style("font-family", "'Montserrat', sans-serif")
//                 .style("color", "#16213e")
//                 .style("text-align", "center")
//                 .style("margin-bottom", "15px");

//             containerDiv.append("p")
//                 .text("Showing relationships between top 4 features selected by PCA loadings")
//                 .style("text-align", "center")
//                 .style("color", "#5c5c5c")
//                 .style("margin-bottom", "20px");

//             const featureTags = containerDiv.append("div")
//                 .style("display", "flex")
//                 .style("flex-wrap", "wrap")
//                 .style("justify-content", "center")
//                 .style("gap", "10px")
//                 .style("margin-bottom", "25px");

//             features.forEach((feature, i) => {
//                 featureTags.append("span")
//                     .attr("class", "feature-tag")
//                     .style("background-color", "#e0f7fa")
//                     .style("color", "#006064")
//                     .style("padding", "6px 12px")
//                     .style("border-radius", "16px")
//                     .style("font-size", "12px")
//                     .style("font-weight", "500")
//                     .style("display", "inline-block")
//                     .text(feature);
//             });

//             const size = Math.min(window.innerWidth * 0.9, 900);
//             const cellSize = size / 4;
//             const padding = cellSize * 0.15;

//             const svg = containerDiv.append("svg")
//                 .attr("width", "800px")
//                 .attr("height", size)
//                 .attr("viewBox", `0 0 ${size} ${size}`)
//                 .attr("preserveAspectRatio", "xMidYMid meet");

//             svg.append("rect")
//                 .attr("width", size)
//                 .attr("height", size)
//                 .attr("fill", "#f8f9fa")
//                 .attr("rx", 8)
//                 .attr("ry", 8);

//             const domains = {};
//             features.forEach(feature => {
//                 const values = data.pairs.map(d => parseFloat(d[feature]));
//                 domains[feature] = [d3.min(values), d3.max(values)];
//                 const range = domains[feature][1] - domains[feature][0];
//                 domains[feature][0] -= range * 0.08;
//                 domains[feature][1] += range * 0.08;
//             });

//             const scales = {};
//             features.forEach(feature => {
//                 scales[feature] = d3.scaleLinear()
//                     .domain(domains[feature])
//                     .range([padding, cellSize - padding]);
//             });

//             const colors = [
//                 "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099",
//                 "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395"
//             ];

//             const defs = svg.append("defs");
//             colors.forEach((color, i) => {
//                 const gradient = defs.append("radialGradient")
//                     .attr("id", `point-gradient-${i}`)
//                     .attr("cx", "0.5")
//                     .attr("cy", "0.5")
//                     .attr("r", "0.5")
//                     .attr("fx", "0.4")
//                     .attr("fy", "0.4");
//                 gradient.append("stop")
//                     .attr("offset", "0%")
//                     .attr("stop-color", d3.rgb(color).brighter(0.5))
//                     .attr("stop-opacity", 1);
//                 gradient.append("stop")
//                     .attr("offset", "100%")
//                     .attr("stop-color", d3.rgb(color).darker(0.3))
//                     .attr("stop-opacity", 1);
//             });
//             const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

//             const legend = containerDiv.append("div")
//                 .attr("class", "cluster-legend")
//                 .style("display", "flex")
//                 .style("justify-content", "center")
//                 .style("margin-top", "20px");

//             const uniqueClusters = [...new Set(data.pairs.map(d => d.cluster))];

//             uniqueClusters.forEach(cluster => {
//                 const legendItem = legend.append("div")
//                     .style("display", "flex")
//                     .style("align-items", "center")
//                     .style("margin-right", "15px");

//                 legendItem.append("div")
//                     .style("width", "12px")
//                     .style("height", "12px")
//                     .style("background-color", colorScale(cluster))
//                     .style("margin-right", "5px");

//                 legendItem.append("span")
//                     .text(`Cluster ${cluster}`)
//                     .style("font-size", "12px");
//             });

//             const tooltip = d3.select("body").selectAll(".scatterplot-tooltip").data([0])
//                 .enter()
//                 .append("div")
//                 .attr("class", "scatterplot-tooltip")
//                 .style("position", "absolute")
//                 .style("visibility", "hidden")
//                 .style("background-color", "rgba(30, 30, 30, 0.9)")
//                 .style("color", "white")
//                 .style("padding", "8px 12px")
//                 .style("border-radius", "6px")
//                 .style("font-size", "12px")
//                 .style("pointer-events", "none")
//                 .style("z-index", 1000)
//                 .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)");

//             for (let i = 0; i < 4; i++) {
//                 for (let j = 0; j < 4; j++) {
//                     const xFeature = features[i];
//                     const yFeature = features[3 - j];
//                     const cellX = i * cellSize;
//                     const cellY = j * cellSize;
//                     const cell = svg.append("g")
//                         .attr("transform", `translate(${cellX}, ${cellY})`);

//                     cell.append("rect")
//                         .attr("width", cellSize)
//                         .attr("height", cellSize)
//                         .attr("fill", "white")
//                         .attr("stroke", "#e0e0e0")
//                         .attr("stroke-width", 1)
//                         .attr("rx", 4)
//                         .attr("ry", 4);

//                     if (xFeature === yFeature) {
//                         cell.append("rect")
//                             .attr("width", cellSize)
//                             .attr("height", cellSize)
//                             .attr("fill", "#f0f7ff")
//                             .attr("stroke", "#e0e0e0")
//                             .attr("stroke-width", 1)
//                             .attr("rx", 4)
//                             .attr("ry", 4);

//                         const nameGroup = cell.append("g")
//                             .attr("transform", `translate(${cellSize/2}, ${cellSize/2})`);

//                         const words = xFeature.split(" ");
//                         const lineHeight = 16;
//                         const maxLines = Math.floor(cellSize/lineHeight) - 1;
//                         words.reduce((lines, word, i) => {
//                             if (lines.length >= maxLines) return lines;
//                             const lastLine = lines[lines.length - 1] || "";
//                             const testLine = lastLine ? `${lastLine} ${word}` : word;
//                             if (testLine.length > 15 && lastLine) {
//                                 lines.push(word);
//                             } else if (lastLine) {
//                                 lines[lines.length - 1] = testLine;
//                             } else {
//                                 lines.push(word);
//                             }
//                             return lines;
//                         }, []).forEach((line, lineIndex) => {
//                             const yOffset = (lineIndex - (words.length - 1) / 2) * lineHeight;
//                             nameGroup.append("text")
//                                 .attr("y", yOffset)
//                                 .attr("text-anchor", "middle")
//                                 .attr("dominant-baseline", "middle")
//                                 .attr("font-weight", "bold")
//                                 .attr("font-size", "12px")
//                                 .attr("font-family", "'Montserrat', sans-serif")
//                                 .attr("fill", "#16213e")
//                                 .text(line);
//                         });
//                         continue;
//                     }

//                     const pointsGroup = cell.append("g")
//                         .attr("class", "points-group")
//                         .style("opacity", 0);

//                         data.pairs.forEach(point => {
//                             if (xFeature in point && yFeature in point) {
//                                 pointsGroup.append("circle")
//                                     .attr("cx", scales[xFeature](parseFloat(point[xFeature])))
//                                     .attr("cy", cellSize - scales[yFeature](parseFloat(point[yFeature])))
//                                     .attr("r", 3.5)
//                                     .attr("class", "dot")
//                                     .attr("fill", d3.schemeCategory10[point.cluster % 10])
//                                     .attr("stroke", "none")
//                                     .attr("opacity", 0.7)
                                    
//                                 .on("mouseover", function(event) {
//                                     d3.select(this)
//                                         .transition()
//                                         .duration(150)
//                                         .attr("r", 6)
//                                         .attr("stroke-width", 1.5);
//                                     tooltip
//                                         .style("visibility", "visible")
//                                         .style("left", (event.pageX + 12) + "px")
//                                         .style("top", (event.pageY - 28) + "px")
//                                         .html(`
//                                             <strong>${xFeature}:</strong> ${parseFloat(point[xFeature]).toFixed(2)}<br>
//                                             <strong>${yFeature}:</strong> ${parseFloat(point[yFeature]).toFixed(2)}<br>
//                                             <strong>Cluster:</strong> ${point.cluster}
//                                         `);
//                                 })
//                                 .on("mouseout", function() {
//                                     d3.select(this)
//                                         .transition()
//                                         .duration(150)
//                                         .attr("r", 3.5)
//                                         .attr("stroke-width", 0.5);
//                                     tooltip.style("visibility", "hidden");
//                                 });
//                         }
//                     });

//                     const xAxis = d3.axisBottom(scales[xFeature]).ticks(5).tickSize(5);
//                     const yAxis = d3.axisLeft(scales[yFeature]).ticks(5).tickSize(5);

//                     cell.append("g")
//                         .attr("transform", `translate(0,${cellSize})`)
//                         .call(xAxis)
//                         .call(g => g.select(".domain").remove())
//                         .call(g => g.selectAll(".tick line").attr("stroke", "#ccc"))
//                         .call(g => g.selectAll(".tick text").attr("font-size", "10px"));

//                     cell.append("g")
//                         .call(yAxis)
//                         .call(g => g.select(".domain").remove())
//                         .call(g => g.selectAll(".tick line").attr("stroke", "#ccc"))
//                         .call(g => g.selectAll(".tick text").attr("font-size", "10px"));

//                     pointsGroup.transition()
//                         .duration(800)
//                         .style("opacity", 1);
//                     document.getElementById("dim-index").innerText = selectedDi;
//                 }
//             }
//         });
// }


// function plotBiplot() {
//     fetch(`http://localhost:5001/biplot?pc1=0&pc2=1&k=${selectedDi}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 d3.select("#biplot").html("<p>Error: No data found.</p>");
//                 return;
//             }

//             const biplotContainer = d3.select("#biplot");
//             biplotContainer.html("");

//             const margin = {top: 50, right: 50, bottom: 50, left: 50};
//             const width = 800 - margin.left - margin.right;
//             const height = 600 - margin.top - margin.bottom;

//             const svg = biplotContainer.append("svg")
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);

//             const xScale = d3.scaleLinear()
//                 .domain([d3.min(data.points.x), d3.max(data.points.x)])
//                 .range([0, width]);

//             const yScale = d3.scaleLinear()
//                 .domain([d3.min(data.points.y), d3.max(data.points.y)])
//                 .range([height, 0]);

           
//             svg.append("g")
//                 .attr("transform", `translate(0,${height})`)
//                 .call(d3.axisBottom(xScale));

//             svg.append("g")
//                 .call(d3.axisLeft(yScale));

        
//             svg.selectAll(".point")
//                 .data(data.points.x.map((x, i) => ({x, y: data.points.y[i], cluster: data.points.clusters[i]})))
//                 .enter().append("circle")
//                 .attr("class", "point")
//                 .attr("cx", d => xScale(d.x))
//                 .attr("cy", d => yScale(d.y))
//                 .attr("r", 3)
//                 .attr("fill", d => d3.schemeCategory10[d.cluster % 10]);

         
//             const loadingScale = 0.9 * Math.min(width, height) / 2;
//             svg.selectAll(".loading")
//                 .data(data.loadings.x.map((x, i) => ({x, y: data.loadings.y[i], feature: data.features[i]})))
//                 .enter().append("line")
//                 .attr("class", "loading")
//                 .attr("x1", xScale(0))
//                 .attr("y1", yScale(0))
//                 .attr("x2", d => xScale(d.x * loadingScale))
//                 .attr("y2", d => yScale(d.y * loadingScale))
//                 .attr("stroke", "red")
//                 .attr("stroke-width", 1);

          
//             svg.selectAll(".loading-label")
//                 .data(data.loadings.x.map((x, i) => ({x, y: data.loadings.y[i], feature: data.features[i]})))
//                 .enter().append("text")
//                 .attr("class", "loading-label")
//                 .attr("x", d => xScale(d.x * loadingScale * 1.1))
//                 .attr("y", d => yScale(d.y * loadingScale * 1.1))
//                 .text(d => d.feature)
//                 .attr("font-size", "10px")
//                 .attr("text-anchor", "middle");

           
//             svg.append("text")
//                 .attr("x", width /5)
//                 .attr("y", -margin.top / 2)
//                 .attr("text-anchor", "middle")
//                 .style("font-size", "16px")
//                 .style("font-weight", "bold")
//                 .text(`Biplot (DI: ${selectedDi})`);

           
//             svg.append("text")
//                 .attr("x", width / 2)
//                 .attr("y", height + margin.bottom - 10)
//                 .attr("text-anchor", "middle")
//                 .text(`PC1 `);

//             svg.append("text")
//                 .attr("transform", "rotate(-90)")
//                 .attr("x", -height / 2)
//                 .attr("y", -margin.left + 20)
//                 .attr("text-anchor", "middle")
//                 .text(`PC2 `);
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             d3.select("#biplot").html(`<p>Error: ${error.message || "Failed to fetch biplot data from the server."}</p>`);
//         });
// }

// function plotElbowCurve(dimIndex) {
//     fetch(`http://localhost:5001/kmeans_elbow?dim=${dimIndex}`)
//         .then(response => response.json())
//         .then(data => {
//             if (!data.k_values || !data.mse_values || data.k_values.length === 0 || data.mse_values.length === 0) {
//                 throw new Error("Invalid data received from /kmeans_elbow endpoint.");
//             }
//         const margin = { top: 50, right: 50, bottom: 50, left: 70 };
//         const width = 800 - margin.left - margin.right;
//         const height = 400 - margin.top - margin.bottom;
  
//         d3.select("#elbow-plot").html("");
  
//         const svg = d3.select("#elbow-plot")
//           .append("svg")
//           .attr("width", width + margin.left + margin.right)
//           .attr("height", height + margin.top + margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
  
//         const xScale = d3.scaleBand()
//           .domain(data.k_values)
//           .range([0, width])
//           .padding(0.2);
  
//         const yScale = d3.scaleLinear()
//           .domain([0, d3.max(data.mse_values)]) //Use data.mse_values
//           .range([height, 0]);
  
  
//         svg.append("g")
//           .attr("transform", `translate(0,${height})`)
//           .call(d3.axisBottom(xScale).tickFormat(d => d))
//           .selectAll("text")
//           .style("text-anchor", "middle");
  
  
//         svg.append("g")
//           .call(d3.axisLeft(yScale));
  
  
//         svg.selectAll(".bar")
//           .data(data.mse_values) //Use data.mse_values
//           .enter()
//           .append("rect")
//           .attr("class", "bar")
//           .attr("x", (_, i) => xScale(data.k_values[i]))
//           .attr("y", d => yScale(d))
//           .attr("width", xScale.bandwidth())
//           .attr("height", d => height - yScale(d))
//           .attr("fill", (_, i) => (data.k_values[i] === data.optimal_k ? "#f39c12" : "#34495e"));
  
  
//         svg.selectAll(".dot")
//           .data(data.mse_values) //Use data.mse_values
//           .enter()
//           .append("circle")
//           .attr("class", "dot")
//           .attr("cx", (_, i) => xScale(data.k_values[i]) + xScale.bandwidth() / 2)
//           .attr("cy", d => yScale(d))
//           .attr("r", 5)
//           .attr("fill", "#e74c3c");
  
  
//         const line = d3.line()
//           .x((_, i) => xScale(data.k_values[i]) + xScale.bandwidth() / 2)
//           .y(d => yScale(d));
  
//         svg.append("path")
//           .datum(data.mse_values) //Use data.mse_values
//           .attr("fill", "none")
//           .attr("stroke", "#e74c3c")
//           .attr("stroke-width", 2)
//           .attr("d", line);
  
  
//         svg.append("line")
//           .attr("x1", xScale(data.optimal_k) + xScale.bandwidth() / 2)
//           .attr("x2", xScale(data.optimal_k) + xScale.bandwidth() / 2)
//           .attr("y1", 0)
//           .attr("y2", height)
//           .attr("stroke", "#e74c3c")
//           .attr("stroke-width", 2)
//           .style("stroke-dasharray", "4");
  
  
//         svg.append("text")
//           .attr("x", width / 2)
//           .attr("y", height + margin.bottom - 10)
//           .attr("text-anchor", "middle")
//           .text("Number of Clusters");
  
//         svg.append("text")
//           .attr("transform", "rotate(-90)")
//           .attr("x", -height / 2)
//           .attr("y", -margin.left + 15)
//           .attr("text-anchor", "middle")
//           .text("Mean Squared Error"); //Changed Text
  
  
//           svg.append("text")
//           .attr("x", width / 2)
//           .attr("y", -20)
//           .attr("text-anchor", "middle")
//           .style("font-size", "16px")
//           .style("font-weight", "bold")
//           .text(`KMeans Elbow Plot (Optimal K = ${data.optimal_k}, , Dim = ${dimIndex})`);

          
//   })

  
//   .catch(error => {
//       console.error(`Error in plotElbowCurve: ${error.message}`);
//       d3.select("#elbow-plot").html(`Error: ${error.message}`);
//   });
//   }
  
  
//   document.addEventListener('DOMContentLoaded', () => {
//     plotElbowCurve(selectedDi);
//   });
  

// function updateBiplotK(newK) {
//     currentK = Math.max(1, newK); // Ensure K is at least 1
//     document.getElementById("biplot-current-k").textContent = currentK;
//     plotBiplot(selectedDi, currentK);
// }
  
  
//   function updateK(newK) {
//     currentK = newK;
//     document.getElementById("current-k").textContent = currentK;
//     plotScatterPlotMatrix();
//     plotBiplot();
//   }




// let selectedVariables = [];

// const memoizedPlotPCP = memoize(plotPCP);
// const memoizedPlotFullPCP = memoize(plotFullPCP);

// function memoize(fn) {
//     const cache = new Map();
//     let lastArgs = null;
//     let lastResult = null;
    
//     return function(...args) {

//       const key = JSON.stringify(args);
      
//       if (lastArgs === key) {
//         return lastResult;
//       }
      

//       if (cache.has(key)) {
//         lastArgs = key;
//         lastResult = cache.get(key);
//         return lastResult;
//       }
      

//       const result = fn.apply(this, args);
//       cache.set(key, result);
//       lastArgs = key;
//       lastResult = result;
      
  
//       if (cache.size > 10) {
//         const firstKey = cache.keys().next().value;
//         cache.delete(firstKey);
//       }
      
//       return result;
//     };
//   }
  


  
// document.addEventListener('DOMContentLoaded', function() {
//     plotScreePlot();
//     plotElbowCurve(selectedDi);
    

//     if (isElementInViewport(document.getElementById('dataMDS'))) {
//       plotDataMDS(currentK);
//       plotsLoaded.dataMDS = true;
//     }
    
//     if (isElementInViewport(document.getElementById('varMDS'))) {
//       plotVarMDS();
//       plotsLoaded.varMDS = true;
//     }
    
    
//     if (isElementInViewport(document.getElementById('pcp-full'))) {
//       memoizedPlotFullPCP();
//       plotsLoaded.fullPcp = true;
//     }

//     window.addEventListener('scroll', debouncedLoadVisiblePlots);
//   });
  
//   function resetPlot(plotName) {
//     if (plotName in plotsLoaded) {
//       plotsLoaded[plotName] = false;
//       loadVisiblePlots();
//     }
//   }
    
// function plotDataMDS(k = null) {
//     const url = new URL("http://localhost:5001/data_mds");
//     if (k !== null) url.searchParams.append('k', k);
    
//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 d3.select("#dataMDS").html(`<text x="400" y="300" text-anchor="middle">Error: ${data.error}</text>`);
//                 return;
//             }
            
//             const margin = { top: 50, right: 70, bottom: 60, left: 60 };
//             const width = 800 - margin.left - margin.right;
//             const height = 600 - margin.top - margin.bottom;
            
//             d3.select("#dataMDS").selectAll("*").remove();
            
//             const svg = d3.select("#dataMDS")
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);
            

//             const xExtent = d3.extent(data.x);
//             const yExtent = d3.extent(data.y);
            
//             const xScale = d3.scaleLinear()
//                 .domain([xExtent[0] - Math.abs(xExtent[0] * 0.1), xExtent[1] + Math.abs(xExtent[1] * 0.1)])
//                 .range([0, width]);
            
//             const yScale = d3.scaleLinear()
//                 .domain([yExtent[0] - Math.abs(yExtent[0] * 0.1), yExtent[1] + Math.abs(yExtent[1] * 0.1)])
//                 .range([height, 0]);
            
//             svg.append("g")
//                 .attr("transform", `translate(0,${height})`)
//                 .call(d3.axisBottom(xScale));
            
//             svg.append("g")
//                 .call(d3.axisLeft(yScale));
            
   
//             const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            
//             svg.selectAll(".point")
//                 .data(data.x.map((x, i) => ({ x, y: data.y[i], cluster: data.clusters[i] })))
//                 .enter()
//                 .append("circle")
//                 .attr("class", "point")
//                 .attr("cx", d => xScale(d.x))
//                 .attr("cy", d => yScale(d.y))
//                 .attr("r", 4)
//                 .attr("fill", d => colorScale(d.cluster))
//                 .attr("opacity", 0.8);
            

//             svg.append("text")
//                 .attr("text-anchor", "middle")
//                 .attr("x", width / 2)
//                 .attr("y", height + 40)
//                 .text("MDS Dimension 1");
            
//             svg.append("text")
//                 .attr("text-anchor", "middle")
//                 .attr("transform", "rotate(-90)")
//                 .attr("x", -height / 2)
//                 .attr("y", -40)
//                 .text("MDS Dimension 2");
            
    
//             svg.append("text")
//                 .attr("x", width / 2)
//                 .attr("y", -20)
//                 .attr("text-anchor", "middle")
//                 .style("font-size", "16px")
//                 .style("font-weight", "bold")
//                 .text("Data MDS Plot (Euclidean Distance)");
            

//             const legend = svg.append("g")
//                 .attr("transform", `translate(${width - 0}, 10)`);
            
//             const uniqueClusters = [...new Set(data.clusters)];
            
//             uniqueClusters.forEach((cluster, i) => {
//                 legend.append("circle")
//                     .attr("cx", 0)
//                     .attr("cy", i * 20)
//                     .attr("r", 5)
//                     .attr("fill", colorScale(cluster));
                
//                 legend.append("text")
//                     .attr("x", 10)
//                     .attr("y", i * 20 + 5)
//                     .text(`Cluster ${cluster}`)
//                     .style("font-size", "12px");
//             });
//         })
//         .catch(error => {
//             console.error("Error loading data MDS:", error);
//             d3.select("#dataMDS").html(`<text x="400" y="300" text-anchor="middle">Error: ${error.message}</text>`);
//         });
// }

// function plotVarMDS() {
//     fetch("http://localhost:5001/var_mds")
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 d3.select("#varMDS").html(`<text x="400" y="300" text-anchor="middle">Error: ${data.error}</text>`);
//                 return;
//             }
            
//             const margin = { top: 50, right: 70, bottom: 60, left: 60 };
//             const width = 800 - margin.left - margin.right;
//             const height = 600 - margin.top - margin.bottom;
            
//             d3.select("#varMDS").selectAll("*").remove();
            
//             const svg = d3.select("#varMDS")
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);
            
     
//             const xExtent = d3.extent(data.x);
//             const yExtent = d3.extent(data.y);
            
//             const xScale = d3.scaleLinear()
//                 .domain([xExtent[0] - Math.abs(xExtent[0] * 0.1), xExtent[1] + Math.abs(xExtent[1] * 0.1)])
//                 .range([0, width]);
            
//             const yScale = d3.scaleLinear()
//                 .domain([yExtent[0] - Math.abs(yExtent[0] * 0.1), yExtent[1] + Math.abs(yExtent[1] * 0.1)])
//                 .range([height, 0]);
            

//             svg.append("g")
//                 .attr("transform", `translate(0,${height})`)
//                 .call(d3.axisBottom(xScale));
            
//             svg.append("g")
//                 .call(d3.axisLeft(yScale));
            

//             const points = svg.selectAll(".var-point")
//                 .data(data.x.map((x, i) => ({ 
//                     x, 
//                     y: data.y[i], 
//                     name: data.features[i],
//                     selected: selectedVariables.includes(data.features[i])
//                 })))
//                 .enter()
//                 .append("g")
//                 .attr("class", "var-point")
//                 .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`)
//                 .style("cursor", "pointer")
//                 .on("click", function(event, d) {
//                     handleVarClick(d, data.features);
//                 });
            
    
//             points.append("circle")
//                 .attr("r", 6)
//                 .attr("fill", d => d.selected ? "#ff4500" : "#1f77b4")
//                 .attr("opacity", 0.8);
            
    
//             points.append("text")
//                 .attr("x", 8)
//                 .attr("y", 4)
//                 .text(d => d.name)
//                 .style("font-size", "12px");
            
     
//             svg.append("text")
//                 .attr("text-anchor", "middle")
//                 .attr("x", width / 2)
//                 .attr("y", height + 40)
//                 .text("MDS Dimension 1");
            
//             svg.append("text")
//                 .attr("text-anchor", "middle")
//                 .attr("transform", "rotate(-90)")
//                 .attr("x", -height / 2)
//                 .attr("y", -40)
//                 .text("MDS Dimension 2");
            
 
//             svg.append("text")
//                 .attr("x", width / 2)
//                 .attr("y", -20)
//                 .attr("text-anchor", "middle")
//                 .style("font-size", "16px")
//                 .style("font-weight", "bold")
//                 .text("Variables MDS Plot (1-|correlation| Distance)");
  
//             updateSelectedVarsList();
//         })
//         .catch(error => {
//             console.error("Error loading variable MDS:", error);
//             d3.select("#varMDS").html(`<text x="400" y="300" text-anchor="middle">Error: ${error.message}</text>`);
//         });
// }

// function handleVarClick(d, features) {
//     const varIndex = selectedVariables.indexOf(d.name);
    
//     if (varIndex === -1) {
//         selectedVariables.push(d.name);
//     } else {
//         selectedVariables.splice(varIndex, 1);
//     }

//     plotVarMDS();

//     updateSelectedVarsList();
// }

// function updateSelectedVarsList() {
//     const container = d3.select("#selected-vars-list");
//     container.html("");
    
//     if (selectedVariables.length === 0) {
//         container.append("p")
//             .text("No variables selected. Click on points in the plot above to select variables.");
//         return;
//     }
    
//     const table = container.append("table")
//         .attr("class", "selected-vars-table");
    
//     const header = table.append("tr");
//     header.append("th").text("#");
//     header.append("th").text("Variable Name");
//     header.append("th").text("Action");
    
//     selectedVariables.forEach((varName, i) => {
//         const row = table.append("tr");
//         row.append("td").text(i + 1);
//         row.append("td").text(varName);
        
//         const actionCell = row.append("td");
//         actionCell.append("button")
//             .attr("class", "remove-var-btn")
//             .text("Remove")
//             .on("click", function() {
//                 selectedVariables.splice(i, 1);
//                 updateSelectedVarsList();
//                 plotVarMDS();
//             });
//     });
    

//     container.append("button")
//         .attr("id", "apply-pcp-btn")
//         .attr("class", "apply-btn")
//         .text("Apply Order to PCP")
//         .on("click", applyOrderToPCP);
// }

// function applyOrderToPCP() {
//     if (selectedVariables.length > 1) {
//         plotPCP(selectedVariables);
//     } else {
//         alert("Please select at least 2 variables for PCP ordering");
//     }
//     d3.select("#pcp").html("");
    
//     memoizedPlotPCP();

//     plotsLoaded.pcp = true;

// }


// function plotPCP(axisOrder = null) {
//     let plotsLoaded = {
//         dataMDS: false,
//         varMDS: false,
//         pcp: false
//       };
//     const url = new URL("http://localhost:5001/pcp_data");
//     if (axisOrder) {
//         url.searchParams.append('axis_order', JSON.stringify(axisOrder));
//     }
    
//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 d3.select("#pcp").html(`<text x="500" y="350" text-anchor="middle">Error: ${data.error}</text>`);
//                 return;
//             }
            
//             const margin = {top: 50, right: 50, bottom: 50, left: 50};
//             const width = 1000 - margin.left - margin.right; 
//             const height = 500 - margin.top - margin.bottom;
            
//             d3.select("#pcp").selectAll("*").remove();
            
//             const svg = d3.select("#pcp")
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);
            
           
//             const dimensions = data.dimensions;

//             const y = {};
//             const dragging = {};
            
//             for (let dim of dimensions) {
 
//                 y[dim] = d3.scaleLinear()
//                     .domain(d3.extent(data.values[dim]))
//                     .range([height, 0]);
//             }
            
   
//             const x = d3.scalePoint()
//                 .range([0, width])
//                 .domain(dimensions);
            
     
//             function path(d) {
//                 return d3.line()(dimensions.map(p => [position(p), y[p](d[p])]));
//             }
            
//             function position(d) {
//                 return dragging[d] || x(d);
//             }
            
         
//             function dragstarted(event, d) {
//                 dragging[d] = x(d);
//             }
            
//             function dragged(event, d) {
//                 dragging[d] = Math.min(width, Math.max(0, event.x));
//                 svg.selectAll(".path-line").attr("d", path);
//                 dimensions.sort((a, b) => position(a) - position(b));
//                 x.domain(dimensions);
//                 svg.selectAll(".axis").attr("transform", d => `translate(${position(d)})`);
//             }
            
//             function dragended(event, d) {
//                 delete dragging[d];
//                 svg.selectAll(".path-line").attr("d", path);
//                 svg.selectAll(".axis")
//                     .transition().duration(500)
//                     .attr("transform", d => `translate(${position(d)})`);
//             }
            
          
//             const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            
           
//             svg.selectAll(".background-line")
//                 .data(data.items)
//                 .enter()
//                 .append("path")
//                 .attr("class", "path-line background-line")
//                 .attr("d", path)
//                 .style("fill", "none")
//                 .style("stroke", "#ddd")
//                 .style("stroke-width", 1)
//                 .style("opacity", 0.3);
            
//                 svg.selectAll(".axis-label")
//                 .data(dimensions)
//                 .enter()
//                 .append("text")
//                 .attr("class", "axis-label")
//                 .attr("x", d => x(d))
//                 .attr("y", -30) 
//                 .attr("text-anchor", "middle")
//                 .attr("font-size", "12px")
//                 .attr("font-weight", "bold")
//                 .text(d => d);
            
            
//             svg.selectAll(".foreground-line")
//                 .data(data.items)
//                 .enter()
//                 .append("path")
//                 .attr("class", "path-line foreground-line")
//                 .attr("d", path)
//                 .style("fill", "none")
//                 .style("stroke", d => colorScale(d.cluster))
//                 .style("stroke-width", 1.5)
//                 .style("opacity", 0.7)
//                 .on("mouseover", function() {
//                     d3.select(this)
//                         .style("stroke-width", 3)
//                         .style("opacity", 1);
//                 })
//                 .on("mouseout", function() {
//                     d3.select(this)
//                         .style("stroke-width", 1.5)
//                         .style("opacity", 0.7);
//                 });
            
           
//             const axes = svg.selectAll(".axis")
//                 .data(dimensions)
//                 .enter()
//                 .append("g")
//                 .attr("class", "axis")
//                 .attr("transform", d => `translate(${x(d)})`)
//                 .call(d3.drag()
//                     .on("start", dragstarted)
//                     .on("drag", dragged)
//                     .on("end", dragended));
            
           
//             axes.append("line")
//                 .attr("y1", 0)
//                 .attr("y2", height)
//                 .style("stroke", "#000")
//                 .style("stroke-width", 1);
            
           
//             axes.append("text")
//                 .attr("y", -10)
//                 .attr("text-anchor", "middle")
//                 .style("font-size", "12px")
//                 .style("font-weight", "bold")
//                 .text(d => d);
            
       
//             axes.each(function(d) {
//                 d3.select(this).call(d3.axisLeft(y[d]));
//             });
            
            
//             const legend = svg.append("g")
//                 .attr("transform", `translate(${width }, -30)`);
            
//             const uniqueClusters = [...new Set(data.items.map(d => d.cluster))];
            
        
//             createClusterLegend("pcp-legend", data.items.map(item => item.cluster));
//         })
//         .catch(error => {
//             console.error("Error loading PCP data:", error);
//             d3.select("#pcp").html(`<text x="500" y="350" text-anchor="middle">Error: ${error.message}</text>`);
//         });
        
// }

// function updateLegendOrder(dimensions) {
//     // Select the legend container
//     const legend = d3.select(".pcp-legend");
//     if (legend.empty()) return; // Exit if legend doesn't exist
    
//     // Reorder legend items to match dimension order
//     dimensions.forEach((dim, i) => {
//         legend.selectAll(`.legend-item[data-dimension="${dim}"]`)
//             .style("order", i) // Use CSS order property for flex items
//             .transition()
//             .duration(500);
//     });
// }

// function createClusterLegend(containerId, clusters) {
//     const container = d3.select(`#${containerId}`);
//     container.html(""); // Clear existing content
    
//     const uniqueClusters = [...new Set(clusters)].sort((a, b) => a - b);
//     const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
//     uniqueClusters.forEach(cluster => {
//       const legendItem = container.append("div")
//         .attr("class", "legend-item");
        
//       legendItem.append("div")
//         .attr("class", "legend-color")
//         .style("background-color", colorScale(cluster));
        
//       legendItem.append("span")
//         .attr("class", "legend-label")
//         .text(`Cluster ${cluster}`);
//     });
//   }

// let fullSelectedVariables = [];


// function plotFullPCP() {
//     fetch('http://localhost:5001/full_pcp_data')
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error("API Error:", data.error);
//                 d3.select("#full-pcp").html(`<div class="error">Error: ${data.error}</div>`);
//                 return;
//             }

//             d3.select("#full-pcp").html("");

//             const margin = {top: 70, right: 50, bottom: 50, left: 50}; 
//             const width = 4000 
//             const height = 500 - margin.top - margin.bottom;
//             const svg = d3.select("#full-pcp")
//                 .append("svg")
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);

      
//             const dimensions = data.dimensions;
//             const categoricalDims = data.categorical_dims || [];
//             const items = data.items;

         
//             const y = {};
//             dimensions.forEach(dimension => {
//                 if (categoricalDims.includes(dimension)) {
                    
//                     const uniqueValues = [...new Set(items.map(d => d[dimension]))];
//                     y[dimension] = d3.scalePoint()
//                         .domain(uniqueValues)
//                         .range([height, 0])
//                         .padding(0.5);
//                 } else {
                 
//                     const values = items.map(d => +d[dimension]);
//                     y[dimension] = d3.scaleLinear()
//                         .domain([d3.min(values), d3.max(values)])
//                         .range([height, 0]);
//                 }
//             });

        
//             const x = d3.scalePoint()
//                 .range([0, width])
//                 .padding(0.1)
//                 .domain(dimensions);

       
//             const axes = svg.selectAll(".axis")
//                 .data(dimensions)
//                 .enter()
//                 .append("g")
//                 .attr("class", "axis")
//                 .attr("transform", d => `translate(${x(d)},0)`)
//                 .each(function(d) {
//                     d3.select(this).call(d3.axisLeft(y[d]));
//                 })
//                 .call(d3.drag()
//                     .on("start", function(event) {
//                         event.sourceEvent.stopPropagation();
//                     })
//                     .on("drag", function(event, d) {
//                         const pos = x.range().map(x => Math.abs(x - event.x)).indexOf(
//                             d3.min(x.range().map(x => Math.abs(x - event.x)))
//                         );
//                         const dimension = dimensions[pos];
//                         if (dimension !== d) {
//                             dimensions.splice(dimensions.indexOf(d), 1);
//                             dimensions.splice(pos, 0, d);
//                             x.domain(dimensions);
//                             axes.attr("transform", d => `translate(${x(d)},0)`);
//                             paths.attr("d", path);
//                         }
//                     })
//                 );

        
//             svg.selectAll(".axis-label")
//                 .data(dimensions)
//                 .enter()
//                 .append("text")
//                 .attr("class", "axis-label")
//                 .attr("x", d => x(d))
//                 .attr("y", -30) 
//                 .attr("text-anchor", "middle")
//                 .attr("font-size", "12px")
//                 .attr("font-weight", "bold")
//                 .text(d => d);

            
//             const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            
       
//             function path(d) {
//                 return d3.line()(dimensions.map(p => {
//                     return [x(p), y[p](d[p])];
//                 }));
//             }


//             const paths = svg.selectAll(".path-line")
//                 .data(items)
//                 .enter()
//                 .append("path")
//                 .attr("class", "path-line")
//                 .attr("d", path)
//                 .style("fill", "none")
//                 .style("stroke", d => colorScale(d.cluster))
//                 .style("opacity", 0.5);

           
//             paths.on("mouseover", function() {
//                 d3.select(this)
//                     .style("stroke-width", "3px")
//                     .style("opacity", 1);
//             })
//             .on("mouseout", function() {
//                 d3.select(this)
//                     .style("stroke-width", "1.5px")
//                     .style("opacity", 0.5);
//             });

        
//             axes.on("click", function(event, d) {
//                 if (!fullSelectedVariables.includes(d)) {
//                     fullSelectedVariables.push(d);
//                     updateFullSelectedVars();
//                 }
//             });

//             createClusterLegend("full-pcp-legend", data.items.map(item => item.cluster));
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             d3.select("#full-pcp").html(`<div class="error">Error: ${error.message}</div>`);
//         });
// }


// function updateFullSelectedVars() {
//     const container = d3.select("#full-selected-vars");
//     container.html("");
    
//     if (fullSelectedVariables.length === 0) return;
    
//     container.append("h3")
//         .text("Selected Variables for Reordering");
    
//     const table = container.append("table")
//         .attr("class", "selected-vars-table");
    
//     const thead = table.append("thead");
//     thead.append("tr")
//         .selectAll("th")
//         .data(["Variable", "Action"])
//         .enter()
//         .append("th")
//         .text(d => d);
    
//     const tbody = table.append("tbody");
//     const rows = tbody.selectAll("tr")
//         .data(fullSelectedVariables)
//         .enter()
//         .append("tr");
    
//     rows.append("td")
//         .text(d => d);
    
//     rows.append("td")
//         .append("button")
//         .attr("class", "remove-var-btn")
//         .text("Remove")
//         .on("click", function(event, d) {
//             fullSelectedVariables = fullSelectedVariables.filter(v => v !== d);
//             updateFullSelectedVars();
//         });
    
//     container.append("button")
//         .attr("class", "apply-btn")
//         .text("Apply Order")
//         .on("click", function() {
//             if (fullSelectedVariables.length > 0) {
//                 const axisOrder = JSON.stringify(fullSelectedVariables);
//                 fetch(`http://localhost:5001/full_pcp_data?axis_order=${axisOrder}`)
//                     .then(response => response.json())
//                     .then(data => {
//                         d3.select("#full-pcp").html("");
//                         plotFullPCP();
//                     })
//                     .catch(error => {
//                         console.error('Error:', error);
//                     });
//             }
//         });
// }


// document.addEventListener('DOMContentLoaded', function() {
    
//     plotFullPCP();
    
    
//     plotsLoaded.fullPCP = false;
    
    
//     function loadVisiblePlots() {
     
        
//         if (!plotsLoaded.fullPCP && isElementInViewport(document.getElementById('full-pcp-container'))) {
//             plotFullPCP();
//             plotsLoaded.fullPCP = true;
//         }
//     }
// });


// // Global variables
// let selectedDimension = 2;
// let currentK = 3;
// let selectedData = [];
// let allData = [];
// let brushedData = [];

// // Create tooltip
// const tooltip = d3.select("#tooltip");

// // Initialize dashboard
// document.addEventListener('DOMContentLoaded', function() {
//     // Set up event listeners for controls
//     document.getElementById('dimension-slider').addEventListener('input', function() {
//         selectedDimension = parseInt(this.value);
//         document.getElementById('dim-value').textContent = selectedDimension;
//         updateAllVisualizations();
//     });
    
//     document.getElementById('cluster-slider').addEventListener('input', function() {
//         currentK = parseInt(this.value);
//         document.getElementById('cluster-value').textContent = currentK;
//         updateAllVisualizations();
//     });
    
//     document.getElementById('reset-btn').addEventListener('click', function() {
//         resetAllBrushes();
//     });
    
//     // Initialize all visualizations
//     initializeVisualizations();
// });

// function initializeVisualizations() {
//     // Load data and create all visualizations
//     Promise.all([
//         fetch('http://localhost:5001/pca').then(res => res.json()),
//         fetch('http://localhost:5001/full_pcp_data').then(res => res.json())
//     ])
//     .then(([pcaData, pcpData]) => {
//         allData = pcpData.items;
        
//         // Create all visualizations
//         createScreePlot(pcaData);
//         createBiplot();
//         createMDSPlot();
//         createGeoMap();
//         createParallelCoordinates(pcpData);
//         createScatterplotMatrix();
//         createBarChart();
//     })
//     .catch(error => {
//         console.error("Error initializing dashboard:", error);
//     });
// }

// function updateAllVisualizations() {
//     createBiplot();
//     createMDSPlot();
//     createScatterplotMatrix();
//     updateBarChart();
// }

// function applyBrushing(brushedIds) {
//     brushedData = brushedIds.length > 0 ? 
//         allData.filter(d => brushedIds.includes(d.index)) : 
//         allData;
    
//     // Update all visualizations with brushed data
//     d3.selectAll(".data-element")
//         .classed("brushed", d => brushedIds.length === 0 || brushedIds.includes(d.index))
//         .classed("not-brushed", d => brushedIds.length > 0 && !brushedIds.includes(d.index));
    
//     updateBarChart();
// }

// function resetAllBrushes() {
//     brushedData = allData;
//     d3.selectAll(".data-element")
//         .classed("brushed", true)
//         .classed("not-brushed", false);
    
//     // Reset all brush elements
//     d3.selectAll(".brush").call(d3.brush().clear);
    
//     updateAllVisualizations();
// }

// function createScreePlot(pcaData) {
//     const container = d3.select("#scree-plot");
//     container.html("");
    
//     const margin = {top: 20, right: 20, bottom: 40, left: 50};
//     const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//     const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
//     const svg = container.append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);
    
//     const eigenvalues = pcaData.eigenvalues;
//     const cumulativeVariance = pcaData.cumulative_variance;
    
//     const xScale = d3.scaleBand()
//         .domain(eigenvalues.map((_, i) => `PC ${i + 1}`))
//         .range([0, width])
//         .padding(0.2);
    
//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(eigenvalues)])
//         .range([height, 0]);
    
//     const yScaleRight = d3.scaleLinear()
//         .domain([0, 1])
//         .range([height, 0]);
    
//     // Add X axis
//     svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(xScale))
//         .selectAll("text")
//         .style("font-size", "8px");
    
//     // Add Y axis
//     svg.append("g")
//         .call(d3.axisLeft(yScale))
//         .selectAll("text")
//         .style("font-size", "8px");
    
//     // Add right Y axis for cumulative variance
//     svg.append("g")
//         .attr("transform", `translate(${width},0)`)
//         .call(d3.axisRight(yScaleRight).ticks(5).tickFormat(d => d * 100 + "%"))
//         .selectAll("text")
//         .style("font-size", "8px");
    
//     // Add bars
//     svg.selectAll(".bar")
//         .data(eigenvalues)
//         .enter()
//         .append("rect")
//         .attr("class", "bar data-element")
//         .attr("x", (_, i) => xScale(`PC ${i + 1}`))
//         .attr("y", d => yScale(d))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => height - yScale(d))
//         .attr("fill", (_, i) => i === selectedDimension - 1 ? "#e74c3c" : "#3498db")
//         .on("click", function(event, d) {
//             const index = eigenvalues.indexOf(d);
//             selectedDimension = index + 1;
//             document.getElementById("dimension-slider").value = selectedDimension;
//             document.getElementById("dim-value").textContent = selectedDimension;
//             updateAllVisualizations();
//         })
//         .on("mouseover", function(event, d) {
//             const i = eigenvalues.indexOf(d);
//             tooltip.style("opacity", 1)
//                 .html(`PC ${i+1}<br>Variance: ${d.toFixed(2)}<br>Cumulative: ${(cumulativeVariance[i] * 100).toFixed(1)}%`)
//                 .style("left", (event.pageX + 10) + "px")
//                 .style("top", (event.pageY - 10) + "px");
//         })
//         .on("mouseout", function() {
//             tooltip.style("opacity", 0);
//         });
    
//     // Add line for cumulative variance
//     const line = d3.line()
//         .x((_, i) => xScale(`PC ${i + 1}`) + xScale.bandwidth() / 2)
//         .y(d => yScaleRight(d));
    
//     svg.append("path")
//         .datum(cumulativeVariance)
//         .attr("fill", "none")
//         .attr("stroke", "#e74c3c")
//         .attr("stroke-width", 2)
//         .attr("d", line);
    
//     // Add dots for cumulative variance
//     svg.selectAll(".dot")
//         .data(cumulativeVariance)
//         .enter()
//         .append("circle")
//         .attr("class", "dot")
//         .attr("cx", (_, i) => xScale(`PC ${i + 1}`) + xScale.bandwidth() / 2)
//         .attr("cy", d => yScaleRight(d))
//         .attr("r", 3)
//         .attr("fill", "#e74c3c");
// }

// function createBiplot() {
//     fetch(`http://localhost:5001/biplot?dim=${selectedDimension}&k=${currentK}`)
//         .then(res => res.json())
//         .then(data => {
//             const container = d3.select("#biplot");
//             container.html("");
            
//             const margin = {top: 20, right: 20, bottom: 40, left: 50};
//             const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//             const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
            
//             const svg = container.append("svg")
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);
            
//             // Create scales
//             const xExtent = d3.extent(data.points.x);
//             const yExtent = d3.extent(data.points.y);
            
//             const xScale = d3.scaleLinear()
//                 .domain([xExtent * 1.1, xExtent[1] * 1.1])
//                 .range([0, width]);
            
//             const yScale = d3.scaleLinear()
//                 .domain([yExtent * 1.1, yExtent[1] * 1.1])
//                 .range([height, 0]);
            
//             // Add axes
//             svg.append("g")
//                 .attr("transform", `translate(0,${height/2})`)
//                 .call(d3.axisBottom(xScale).ticks(5))
//                 .selectAll("text")
//                 .style("font-size", "8px");
            
//             svg.append("g")
//                 .attr("transform", `translate(${width/2},0)`)
//                 .call(d3.axisLeft(yScale).ticks(5))
//                 .selectAll("text")
//                 .style("font-size", "8px");
            
//             // Add points
//             const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            
//             const points = svg.append("g")
//                 .selectAll(".point")
//                 .data(data.points.x.map((x, i) => ({
//                     x: x,
//                     y: data.points.y[i],
//                     cluster: data.points.clusters[i],
//                     index: i
//                 })))
//                 .enter()
//                 .append("circle")
//                 .attr("class", "point data-element")
//                 .attr("cx", d => xScale(d.x))
//                 .attr("cy", d => yScale(d.y))
//                 .attr("r", 3)
//                 .attr("fill", d => colorScale(d.cluster))
//                 .attr("opacity", 0.7)
//                 .on("mouseover", function(event, d) {
//                     d3.select(this)
//                         .transition()
//                         .duration(200)
//                         .attr("r", 6);
                    
//                     tooltip.style("opacity", 1)
//                         .html(`Cluster: ${d.cluster}<br>PC1: ${d.x.toFixed(2)}<br>PC2: ${d.y.toFixed(2)}`)
//                         .style("left", (event.pageX + 10) + "px")
//                         .style("top", (event.pageY - 10) + "px");
//                 })
//                 .on("mouseout", function() {
//                     d3.select(this)
//                         .transition()
//                         .duration(200)
//                         .attr("r", 3);
                    
//                     tooltip.style("opacity", 0);
//                 })
//                 .on("click", function(event, d) {
//                     const isSelected = d3.select(this).classed("selected");
                    
//                     if (isSelected) {
//                         selectedData = selectedData.filter(item => item.index !== d.index);
//                         d3.select(this).classed("selected", false);
//                     } else {
//                         selectedData.push(d);
//                         d3.select(this).classed("selected", true);
//                     }
                    
//                     applyBrushing(selectedData.map(d => d.index));
//                 });
            
//             // Add loadings (feature vectors)
//             const loadingScale = 0.8 * Math.min(width, height) / 2;
            
//             svg.selectAll(".loading")
//                 .data(data.loadings.x.map((x, i) => ({
//                     x: x,
//                     y: data.loadings.y[i],
//                     feature: data.features[i]
//                 })))
//                 .enter()
//                 .append("line")
//                 .attr("class", "loading")
//                 .attr("x1", xScale(0))
//                 .attr("y1", yScale(0))
//                 .attr("x2", d => xScale(d.x * loadingScale))
//                 .attr("y2", d => yScale(d.y * loadingScale))
//                 .attr("stroke", "#e74c3c")
//                 .attr("stroke-width", 1);
            
//             svg.selectAll(".loading-label")
//                 .data(data.loadings.x.map((x, i) => ({
//                     x: x,
//                     y: data.loadings.y[i],
//                     feature: data.features[i]
//                 })))
//                 .enter()
//                 .append("text")
//                 .attr("class", "loading-label")
//                 .attr("x", d => xScale(d.x * loadingScale * 1.1))
//                 .attr("y", d => yScale(d.y * loadingScale * 1.1))
//                 .text(d => d.feature)
//                 .attr("font-size", "8px")
//                 .attr("text-anchor", "middle");
            
//             // Add brush
//             const brush = d3.brush()
//                 .extent([, [width, height]])
//                 .on("end", brushed);
            
//             svg.append("g")
//                 .attr("class", "brush")
//                 .call(brush);
            
//             function brushed(event) {
//                 if (!event.selection) return;
                
//                 const [[x0, y0], [x1, y1]] = event.selection;
                
//                 const selected = data.points.x.map((x, i) => ({
//                     x: x,
//                     y: data.points.y[i],
//                     index: i
//                 })).filter(d => {
//                     const brushX = xScale(d.x);
//                     const brushY = yScale(d.y);
//                     return brushX >= x0 && brushX <= x1 && brushY >= y0 && brushY <= y1;
//                 });
                
//                 selectedData = selected;
//                 applyBrushing(selected.map(d => d.index));
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             d3.select("#biplot").html(`Error: ${error.message || "Failed to fetch biplot data from the server."}`);
//         });
//     }

//     function createMDSPlot() {
//         fetch('http://localhost:5001/data_mds?k=${currentK}')
//         .then(response => response.json())
//         .then(data => {
//         const container = d3.select("#dataMDS");
//         container.html("");
//         const margin = {top: 20, right: 20, bottom: 40, left: 50};
//         const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//         const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
        
//         const svg = container.append("svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);
        
//         // Create scales
//         const xExtent = d3.extent(data.x);
//         const yExtent = d3.extent(data.y);
        
//         const xScale = d3.scaleLinear()
//             .domain([xExtent * 1.1, xExtent[1] * 1.1])
//             .range([0, width]);
        
//         const yScale = d3.scaleLinear()
//             .domain([yExtent * 1.1, yExtent[1] * 1.1])
//             .range([height, 0]);
        
//         // Add axes
//         svg.append("g")
//             .attr("transform", `translate(0,${height})`)
//             .call(d3.axisBottom(xScale).ticks(5))
//             .selectAll("text")
//             .style("font-size", "8px");
        
//         svg.append("g")
//             .call(d3.axisLeft(yScale).ticks(5))
//             .selectAll("text")
//             .style("font-size", "8px");
        
//         // Add points
//         const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
//         const points = svg.append("g")
//             .selectAll(".point")
//             .data(data.x.map((x, i) => ({
//                 x: x,
//                 y: data.y[i],
//                 cluster: data.clusters[i],
//                 index: i
//             })))
//             .enter()
//             .append("circle")
//             .attr("class", "point data-element")
//             .attr("cx", d => xScale(d.x))
//             .attr("cy", d => yScale(d.y))
//             .attr("r", 3)
//             .attr("fill", d => colorScale(d.cluster))
//             .attr("opacity", 0.7)
//             .on("mouseover", function(event, d) {
//                 d3.select(this)
//                     .transition()
//                     .duration(200)
//                     .attr("r", 6);
                
//                 tooltip.style("opacity", 1)
//                     .html(`Cluster: ${d.cluster}`)
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 10) + "px");
//             })
//             .on("mouseout", function() {
//                 d3.select(this)
//                     .transition()
//                     .duration(200)
//                     .attr("r", 3);
                
//                 tooltip.style("opacity", 0);
//             })
//             .on("click", function(event, d) {
//                 const isSelected = d3.select(this).classed("selected");
                
//                 if (isSelected) {
//                     selectedData = selectedData.filter(item => item.index !== d.index);
//                     d3.select(this).classed("selected", false);
//                 } else {
//                     selectedData.push(d);
//                     d3.select(this).classed("selected", true);
//                 }
                
//                 applyBrushing(selectedData.map(d => d.index));
//             });
        
//         // Add brush
//         const brush = d3.brush()
//             .extent([, [width, height]])
//             .on("end", brushed);
        
//         svg.append("g")
//             .attr("class", "brush")
//             .call(brush);
        
//         function brushed(event) {
//             if (!event.selection) return;
            
//             const [[x0, y0], [x1, y1]] = event.selection;
            
//             const selected = data.x.map((x, i) => ({
//                 x: x,
//                 y: data.y[i],
//                 index: i
//             })).filter(d => {
//                 const brushX = xScale(d.x);
//                 const brushY = yScale(d.y);
//                 return brushX >= x0 && brushX <= x1 && brushY >= y0 && brushY <= y1;
//             });
            
//             selectedData = selected;
//             applyBrushing(selected.map(d => d.index));
//         }
        
//         // Add legend
//         const legend = svg.append("g")
//             .attr("class", "legend")
//             .attr("transform", `translate(${width - 100}, 20)`);
        
//         const uniqueClusters = [...new Set(data.clusters)];
        
//         uniqueClusters.forEach((cluster, i) => {
//             legend.append("circle")
//                 .attr("cx", 0)
//                 .attr("cy", i * 20)
//                 .attr("r", 5)
//                 .attr("fill", colorScale(cluster));
            
//             legend.append("text")
//                 .attr("x", 10)
//                 .attr("y", i * 20 + 4)
//                 .text(`Cluster ${cluster}`)
//                 .attr("font-size", "8px");
//         });
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         d3.select("#dataMDS").html(`Error: ${error.message || "Failed to fetch MDS data from the server."}`);
//     });
//     }

//     function createGeoMap() {
//         fetch('http://localhost:5001/full_pcp_data')
//         .then(response => response.json())
//         .then(data => {
//         const container = d3.select("#geo-map");
//         container.html("");
//         const margin = {top: 20, right: 20, bottom: 40, left: 50};
//         const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//         const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
        
//         const svg = container.append("svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);
        
//         // Create projection
//         const projection = d3.geoMercator()
//             .center([-73.95, 40.7]) // NYC coordinates
//             .scale(60000)
//             .translate([width / 2, height / 2]);
        
//         const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
//         // Extract latitude and longitude
//         const points = data.items.map((d, i) => ({
//             latitude: d.Latitude,
//             longitude: d.Longitude,
//             cluster: d.cluster,
//             index: i,
//             borough: d.Borough,
//             units: d["All Counted Units"]
//         })).filter(d => !isNaN(d.latitude) && !isNaN(d.longitude));
        
//         // Add points
//         svg.selectAll(".point")
//             .data(points)
//             .enter()
//             .append("circle")
//             .attr("class", "point data-element")
//             .attr("cx", d => projection([d.longitude, d.latitude]))
//             .attr("cy", d => projection([d.longitude, d.latitude])[1])
//             .attr("r", d => Math.sqrt(d.units) / 2)
//             .attr("fill", d => colorScale(d.cluster))
//             .attr("opacity", 0.7)
//             .attr("stroke", "#fff")
//             .attr("stroke-width", 0.5)
//             .on("mouseover", function(event, d) {
//                 d3.select(this)
//                     .transition()
//                     .duration(200)
//                     .attr("r", Math.sqrt(d.units) / 2 + 3);
                
//                 tooltip.style("opacity", 1)
//                     .html(`Borough: ${d.borough}<br>Units: ${d.units}<br>Cluster: ${d.cluster}`)
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 10) + "px");
//             })
//             .on("mouseout", function(event, d) {
//                 d3.select(this)
//                     .transition()
//                     .duration(200)
//                     .attr("r", Math.sqrt(d.units) / 2);
                
//                 tooltip.style("opacity", 0);
//             })
//             .on("click", function(event, d) {
//                 const isSelected = d3.select(this).classed("selected");
                
//                 if (isSelected) {
//                     selectedData = selectedData.filter(item => item.index !== d.index);
//                     d3.select(this).classed("selected", false);
//                 } else {
//                     selectedData.push(d);
//                     d3.select(this).classed("selected", true);
//                 }
                
//                 applyBrushing(selectedData.map(d => d.index));
//             });
        
//         // Add brush
//         const brush = d3.brush()
//             .extent([, [width, height]])
//             .on("end", brushed);
        
//         svg.append("g")
//             .attr("class", "brush")
//             .call(brush);
        
//         function brushed(event) {
//             if (!event.selection) return;
            
//             const [[x0, y0], [x1, y1]] = event.selection;
            
//             const selected = points.filter(d => {
//                 const [px, py] = projection([d.longitude, d.latitude]);
//                 return px >= x0 && px <= x1 && py >= y0 && py <= y1;
//             });
            
//             selectedData = selected;
//             applyBrushing(selected.map(d => d.index));
//         }
        
//         // Add legend
//         const legend = svg.append("g")
//             .attr("class", "legend")
//             .attr("transform", `translate(${width - 100}, 20)`);
        
//         const uniqueClusters = [...new Set(points.map(d => d.cluster))];
        
//         uniqueClusters.forEach((cluster, i) => {
//             legend.append("circle")
//                 .attr("cx", 0)
//                 .attr("cy", i * 20)
//                 .attr("r", 5)
//                 .attr("fill", colorScale(cluster));
            
//             legend.append("text")
//                 .attr("x", 10)
//                 .attr("y", i * 20 + 4)
//                 .text(`Cluster ${cluster}`)
//                 .attr("font-size", "8px");
//         });
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         d3.select("#geo-map").html(`Error: ${error.message || "Failed to fetch geo data from the server."}`);
//     });
//     }

//     function createParallelCoordinates(data) {
//         const container = d3.select("#pcp-full");
//         container.html("");
//         const margin = {top: 30, right: 10, bottom: 10, left: 10};
// const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
// const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

// const svg = container.append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// // Use only numerical dimensions for PCP
// const dimensions = data.numerical_dims;

// // Create scales for each dimension
// const y = {};
// dimensions.forEach(dimension => {
//     y[dimension] = d3.scaleLinear()
//         .domain(d3.extent(data.items, d => +d[dimension]))
//         .range([height, 0]);
// });

// // Create x scale for dimensions
// const x = d3.scalePoint()
//     .range([0, width])
//     .domain(dimensions);

// // Create color scale for clusters
// const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// // Add axes
// const axes = svg.selectAll(".axis")
//     .data(dimensions)
//     .enter()
//     .append("g")
//     .attr("class", "axis")
//     .attr("transform", d => `translate(${x(d)},0)`)
//     .each(function(d) {
//         d3.select(this).call(d3.axisLeft(y[d]).ticks(5));
//     })
//     .append("text")
//     .style("text-anchor", "middle")
//     .attr("y", -9)
//     .text(d => d)
//     .style("fill", "black")
//     .style("font-size", "10px");

// // Add lines
// const line = d3.line()
//     .defined(d => !isNaN(d[1]))
//     .x(d => x(d))
//     .y(d => y[d](d[1]));

// const path = svg.append("g")
//     .attr("class", "paths")
//     .selectAll("path")
//     .data(data.items)
//     .enter()
//     .append("path")
//     .attr("class", "path-line data-element")
//     .attr("d", d => {
//         return line(dimensions.map(p => [p, +d[p]]));
//     })
//     .attr("stroke", d => colorScale(d.cluster))
//     .attr("fill", "none")
//     .attr("stroke-width", 1.5)
//     .attr("opacity", 0.7)
//     .on("mouseover", function(event, d) {
//         d3.select(this)
//             .attr("stroke-width", 3)
//             .attr("opacity", 1);
        
//         tooltip.style("opacity", 1)
//             .html(`Cluster: ${d.cluster}<br>Borough: ${d.Borough}`)
//             .style("left", (event.pageX + 10) + "px")
//             .style("top", (event.pageY - 10) + "px");
//     })
//     .on("mouseout", function() {
//         d3.select(this)
//             .attr("stroke-width", 1.5)
//             .attr("opacity", 0.7);
        
//         tooltip.style("opacity", 0);
//     })
//     .on("click", function(event, d) {
//         const isSelected = d3.select(this).classed("selected");
        
//         if (isSelected) {
//             selectedData = selectedData.filter(item => item.index !== d.index);
//             d3.select(this).classed("selected", false);
//         } else {
//             selectedData.push({index: d.index});
//             d3.select(this).classed("selected", true);
//         }
        
//         applyBrushing(selectedData.map(d => d.index));
//     });

// // Add brushes to each axis
// dimensions.forEach(dimension => {
//     const axisBrush = d3.brushY()
//         .extent([[-10, 0], [10, height]])
//         .on("end", brushed);
    
//     svg.append("g")
//         .attr("class", `brush brush-${dimension}`)
//         .attr("transform", `translate(${x(dimension)},0)`)
//         .call(axisBrush);
    
//     function brushed(event) {
//         if (!event.selection) return;
        
//         const [y0, y1] = event.selection;
        
//         const selected = data.items.filter(d => {
//             const value = y[dimension](+d[dimension]);
//             return value >= y0 && value <= y1;
//         });
        
//         selectedData = selected;
//         applyBrushing(selected.map(d => d.index));
//     }
// });

// // Add legend
// const legend = svg.append("g")
//     .attr("class", "legend")
//     .attr("transform", `translate(${width - 100}, 20)`);

// const uniqueClusters = [...new Set(data.items.map(d => d.cluster))];

// uniqueClusters.forEach((cluster, i) => {
//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", i * 20)
//         .attr("width", 10)
//         .attr("height", 10)
//         .attr("fill", colorScale(cluster));
    
//     legend.append("text")
//         .attr("x", 15)
//         .attr("y", i * 20 + 9)
//         .text(`Cluster ${cluster}`)
//         .attr("font-size", "10px");
// });
//     }

//     function createScatterplotMatrix() {
//         fetch("http://localhost:5001/scatterplot_matrix?dim_index=${selectedDimension}&k=${currentK}")
//         .then(response => response.json())
//         .then(data => {
//         const container = d3.select("#scatterplot-matrix");
//         container.html("");
//         const margin = {top: 20, right: 20, bottom: 40, left: 40};
//         const size = container.node().getBoundingClientRect().width - margin.left - margin.right;
//         const cellSize = size / 4;
        
//         const svg = container.append("svg")
//             .attr("width", size + margin.left + margin.right)
//             .attr("height", size + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);
        
//         const features = data.features;
        
//         // Create scales for each feature
//         const x = {};
//         const y = {};
        
//         features.forEach(feature => {
//             const values = data.pairs.map(d => parseFloat(d[feature]));
//             const extent = d3.extent(values);
            
//             x[feature] = d3.scaleLinear()
//                 .domain(extent)
//                 .range([0, cellSize]);
            
//             y[feature] = d3.scaleLinear()
//                 .domain(extent)
//                 .range([cellSize, 0]);
//         });
        
//         // Create color scale for clusters
//         const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
//         // Create cells
//         for (let i = 0; i < features.length; i++) {
//             for (let j = 0; j < features.length; j++) {
//                 const xFeature = features[i];
//                 const yFeature = features[j];
                
//                 const cell = svg.append("g")
//                     .attr("transform", `translate(${i * cellSize},${j * cellSize})`);
                
//                 // Add cell border
//                 cell.append("rect")
//                     .attr("width", cellSize)
//                     .attr("height", cellSize)
//                     .attr("fill", "none")
//                     .attr("stroke", "#ccc");
                
//                 if (i === j) {
//                     // Diagonal cells: feature names
//                     cell.append("text")
//                         .attr("x", cellSize / 2)
//                         .attr("y", cellSize / 2)
//                         .attr("text-anchor", "middle")
//                         .attr("dominant-baseline", "middle")
//                         .text(xFeature)
//                         .style("font-size", "8px");
//                 } else {
//                     // Add points
//                     cell.selectAll(".point")
//                         .data(data.pairs)
//                         .enter()
//                         .append("circle")
//                         .attr("class", "point data-element")
//                         .attr("cx", d => x[xFeature](parseFloat(d[xFeature])))
//                         .attr("cy", d => y[yFeature](parseFloat(d[yFeature])))
//                         .attr("r", 2)
//                         .attr("fill", d => colorScale(d.cluster))
//                         .attr("opacity", 0.7)
//                         .on("mouseover", function(event, d) {
//                             d3.select(this)
//                                 .transition()
//                                 .duration(200)
//                                 .attr("r", 5);
                            
//                             tooltip.style("opacity", 1)
//                                 .html(`Cluster: ${d.cluster}<br>${xFeature}: ${parseFloat(d[xFeature]).toFixed(2)}<br>${yFeature}: ${parseFloat(d[yFeature]).toFixed(2)}`)
//                                 .style("left", (event.pageX + 10) + "px")
//                                 .style("top", (event.pageY - 10) + "px");
//                         })
//                         .on("mouseout", function() {
//                             d3.select(this)
//                                 .transition()
//                                 .duration(200)
//                                 .attr("r", 2);
                            
//                             tooltip.style("opacity", 0);
//                         })
//                         .on("click", function(event, d) {
//                             const isSelected = d3.select(this).classed("selected");
                            
//                             if (isSelected) {
//                                 selectedData = selectedData.filter(item => item.index !== d.index);
//                                 d3.select(this).classed("selected", false);
//                             } else {
//                                 selectedData.push(d);
//                                 d3.select(this).classed("selected", true);
//                             }
                            
//                             applyBrushing(selectedData.map(d => d.index));
//                         });
                    
//                     // Add brush
//                     const brush = d3.brush()
//                         .extent([, [cellSize, cellSize]])
//                         .on("end", brushed);
                    
//                     cell.append("g")
//                         .attr("class", "brush")
//                         .call(brush);
                    
//                     function brushed(event) {
//                         if (!event.selection) return;
                        
//                         const [[x0, y0], [x1, y1]] = event.selection;
                        
//                         const selected = data.pairs.filter(d => {
//                             const brushX = x[xFeature](parseFloat(d[xFeature]));
//                             const brushY = y[yFeature](parseFloat(d[yFeature]));
//                             return brushX >= x0 && brushX <= x1 && brushY >= y0 && brushY <= y1;
//                         });
                        
//                         selectedData = selected;
//                         applyBrushing(selected.map(d => d.index));
//                     }
//                 }
//             }
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         d3.select("#scatterplot-matrix").html(`Error: ${error.message || "Failed to fetch scatterplot matrix data from the server."}`);
//     });
//     }

//     function createBarChart() {
//         const container = d3.select("#bar-chart");
//         container.html("");
//         const margin = {top: 30, right: 20, bottom: 70, left: 50};
// const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
// const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

// const svg = container.append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// // Income level categories
// const incomeCategories = [
//     "Extremely Low Income Units", 
//     "Very Low Income Units", 
//     "Low Income Units",
//     "Moderate Income Units", 
//     "Middle Income Units", 
//     "Other Income Units"
// ];

// // Create scales
// const x = d3.scaleBand()
//     .domain(incomeCategories)
//     .range([0, width])
//     .padding(0.2);

// const y = d3.scaleLinear()
//     .range([height, 0]);

// // Add axes
// svg.append("g")
//     .attr("transform", `translate(0,${height})`)
//     .call(d3.axisBottom(x))
//     .selectAll("text")
//     .attr("transform", "rotate(-45)")
//     .style("text-anchor", "end")
//     .style("font-size", "8px");

// svg.append("g")
//     .attr("class", "y-axis")
//     .call(d3.axisLeft(y));

// // Add title
// svg.append("text")
//     .attr("x", width / 2)
//     .attr("y", -10)
//     .attr("text-anchor", "middle")
//     .style("font-size", "12px")
//     .style("font-weight", "bold")
//     .text("Units by Income Level");

// // Create bars group
// svg.append("g")
//     .attr("class", "bars");

// // Initial update
// updateBarChart();
//     }

// // Global state variables
// let selectedDim = 2;
// let currentK = 3;
// let selectedDataIndices = new Set();  // indices for brushed/selected items

// // Update slider labels
// const dimSlider = document.getElementById("dimension-slider");
// const clusterSlider = document.getElementById("cluster-slider");
// const dimValue = document.getElementById("dim-value");
// const clusterValue = document.getElementById("cluster-value");
// const resetBtn = document.getElementById("reset-btn");

// dimSlider.addEventListener("input", function() {
//   selectedDim = +this.value;
//   dimValue.textContent = this.value;
//   updateAllVisualizations();
// });

// clusterSlider.addEventListener("input", function() {
//   currentK = +this.value;
//   clusterValue.textContent = this.value;
//   updateAllVisualizations();
// });

// resetBtn.addEventListener("click", function() {
//   selectedDataIndices.clear();
//   updateAllVisualizations();
// });

// // Debounce function to avoid excessive re-rendering
// function debounce(func, wait) {
//   let timeout;
//   return function(...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// // Global tooltip
// const tooltip = d3.select("#tooltip");

// // Update all visualizations when parameters or selections change
// function updateAllVisualizations() {
//   plotScreePlot();
//   plotBiplot();
//   plotDataMDS();
//   plotGeoMap();
//   plotFullPCP();
//   plotScatterPlotMatrix();
//   updateBarChart();
// }

// // -------------------------
// // PCA Scree Plot
// // -------------------------
// function plotScreePlot() {
//   fetch('http://localhost:5001/pca')
//     .then(response => response.json())
//     .then(data => {
//       const eigenvalues = data.eigenvalues;
//       const cumulative = data.cumulative_variance;
//       const margin = {top: 20, right: 20, bottom: 40, left: 50};
//       const container = d3.select("#scree-plot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

//       const svg = container.append("svg")
//         .attr("width", width+margin.left+margin.right)
//         .attr("height", height+margin.top+margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//       const x = d3.scaleBand()
//         .domain(eigenvalues.map((_,i) => "PC " + (i+1)))
//         .range([0,width])
//         .padding(0.2);

//       const y = d3.scaleLinear()
//         .domain([0, d3.max(eigenvalues)])
//         .nice()
//         .range([height,0]);

//       svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x));

//       svg.append("g")
//         .call(d3.axisLeft(y));

//       svg.selectAll(".bar")
//         .data(eigenvalues)
//         .enter()
//         .append("rect")
//         .attr("class", "bar")
//         .attr("x", (_,i)=> x("PC " + (i+1)))
//         .attr("y", d => y(d))
//         .attr("width", x.bandwidth())
//         .attr("height", d => height - y(d))
//         .attr("fill", (_,i)=> i === selectedDim-1 ? "#e74c3c" : "#3498db")
//         .on("mouseover", function(event,d,i) {
//           tooltip.style("display", "block")
//                  .html(`PC ${i+1}<br>Variance: ${d.toFixed(2)}<br>Cumulative: ${(cumulative[i]*100).toFixed(1)}%`)
//                  .style("left", (event.pageX + 10) + "px")
//                  .style("top", (event.pageY - 20) + "px");
//         })
//         .on("mouseout", function() { tooltip.style("display", "none"); })
//         .on("click", function(event,d,i) {
//           selectedDim = i+1;
//           dimSlider.value = selectedDim;
//           dimValue.textContent = selectedDim;
//           updateAllVisualizations();
//         });

//       // Draw cumulative variance line
//       const line = d3.line()
//         .x((d,i)=> x("PC " + (i+1)) + x.bandwidth()/2)
//         .y(d=> y(d * d3.max(eigenvalues)));

//       svg.append("path")
//         .datum(cumulative)
//         .attr("fill", "none")
//         .attr("stroke", "#000")
//         .attr("stroke-width", 2)
//         .attr("d", line);
//     })
//     .catch(error => console.error("Error in Scree Plot:", error));
// }

// // -------------------------
// // PCA Biplot
// // -------------------------
// function plotBiplot() {
//   fetch(`http://localhost:5001/biplot?pc1=0&pc2=1&k=${currentK}&dim=${selectedDim}`)
//     .then(response => response.json())
//     .then(data => {
//       const margin = {top: 20, right: 20, bottom: 40, left: 50};
//       const container = d3.select("#biplot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);

//       // Scales for PCA space
//       const x = d3.scaleLinear()
//           .domain(d3.extent(data.points.x))
//           .range([0, width]);
//       const y = d3.scaleLinear()
//           .domain(d3.extent(data.points.y))
//           .range([height, 0]);

//       svg.append("g")
//           .attr("transform", `translate(0,${height})`)
//           .call(d3.axisBottom(x));
//       svg.append("g")
//           .call(d3.axisLeft(y));

//       // Draw points
//       svg.selectAll(".point")
//           .data(data.points.x.map((d, i) => ({x: d, y: data.points.y[i], cluster: data.points.clusters[i], index: i})))
//           .enter().append("circle")
//           .attr("class", d=> selectedDataIndices.has(d.index) ? "selected" : "")
//           .attr("cx", d => x(d.x))
//           .attr("cy", d => y(d.y))
//           .attr("r", 3)
//           .attr("fill", d => d3.schemeCategory10[d.cluster % 10])
//           .on("mouseover", function(event,d) {
//             tooltip.style("display", "block")
//                    .html(`Cluster: ${d.cluster}`)
//                    .style("left", (event.pageX + 10) + "px")
//                    .style("top", (event.pageY - 20) + "px");
//           })
//           .on("mouseout", () => tooltip.style("display", "none"))
//           .on("click", function(event,d) {
//             if(selectedDataIndices.has(d.index)){
//               selectedDataIndices.delete(d.index);
//             } else {
//               selectedDataIndices.add(d.index);
//             }
//             updateAllVisualizations();
//           });

//       // Draw loading vectors (arrows)
//       const loadingScale = Math.min(width, height) * 0.4;
//       svg.selectAll(".loading")
//           .data(data.loadings.x.map((d,i)=> ({x: d, y: data.loadings.y[i], feature: data.features[i]})))
//           .enter().append("line")
//           .attr("x1", x(0))
//           .attr("y1", y(0))
//           .attr("x2", d => x(d.x * loadingScale))
//           .attr("y2", d => y(d.y * loadingScale))
//           .attr("stroke", "red")
//           .attr("stroke-width", 1);
//       svg.selectAll(".loading-label")
//           .data(data.loadings.x.map((d,i)=> ({x: d, y: data.loadings.y[i], feature: data.features[i]})))
//           .enter().append("text")
//           .attr("x", d => x(d.x * loadingScale * 1.1))
//           .attr("y", d => y(d.y * loadingScale * 1.1))
//           .text(d => d.feature)
//           .attr("font-size", "10px")
//           .attr("text-anchor", "middle");
//     })
//     .catch(error => console.error("Error in Biplot:", error));
// }

// // -------------------------
// // Data MDS Plot
// // -------------------------
// function plotDataMDS() {
//   fetch(`http://localhost:5001/data_mds?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const margin = {top: 20, right: 20, bottom: 20, left: 20};
//       const container = d3.select("#dataMDS");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       const x = d3.scaleLinear()
//           .domain(d3.extent(data.x))
//           .range([0,width]);
//       const y = d3.scaleLinear()
//           .domain(d3.extent(data.y))
//           .range([height,0]);
      
//       svg.append("g")
//           .attr("transform", `translate(0,${height})`)
//           .call(d3.axisBottom(x));
//       svg.append("g")
//           .call(d3.axisLeft(y));
      
//       svg.selectAll(".mds-point")
//           .data(data.x.map((d,i)=> ({x: d, y: data.y[i], cluster: data.clusters[i], index: i})))
//           .enter().append("circle")
//           .attr("class", d=> selectedDataIndices.has(d.index) ? "selected" : "")
//           .attr("cx", d=> x(d.x))
//           .attr("cy", d=> y(d.y))
//           .attr("r", 3)
//           .attr("fill", d=> d3.schemeCategory10[d.cluster % 10])
//           .on("mouseover", function(event,d){
//             tooltip.style("display", "block")
//                    .html(`Cluster: ${d.cluster}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY -20)+"px");
//           })
//           .on("mouseout", () => tooltip.style("display", "none"))
//           .on("click", function(event,d){
//             if(selectedDataIndices.has(d.index)){
//               selectedDataIndices.delete(d.index);
//             } else {
//               selectedDataIndices.add(d.index);
//             }
//             updateAllVisualizations();
//           });
//     })
//     .catch(error => console.error("Error in Data MDS:", error));
// }

// // -------------------------
// // Geo Map Plot
// // -------------------------
// function plotGeoMap() {
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const items = data.items.filter(d => d.Latitude && d.Longitude);
//       const margin = {top: 10, right: 10, bottom: 10, left: 10};
//       const container = d3.select("#geo-map");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       // Use d3.geoMercator with NYC centered and scaled.
//       const projection = d3.geoMercator()
//             .center([-73.95, 40.7])
//             .scale(60000)
//             .translate([width/2, height/2]);
      
//       // Draw circles for each building
//       svg.selectAll(".geo-point")
//         .data(items.map((d,i)=> ({ 
//           coordinates: [ +d.Longitude, +d.Latitude ],
//           cluster: d.cluster,
//           index: i,
//           borough: d["Borough"],
//           total: +d["Total Units"]
//         })))
//         .enter().append("circle")
//         .attr("cx", d=> projection(d.coordinates)[0])
//         .attr("cy", d=> projection(d.coordinates)[1])
//         .attr("r", d=> Math.sqrt(d.total)/2)
//         .attr("fill", d=> d3.schemeCategory10[d.cluster % 10])
//         .attr("stroke", "#fff")
//         .attr("stroke-width", 0.5)
//         .on("mouseover", function(event,d){
//            tooltip.style("display", "block")
//                   .html(`Borough: ${d.borough}<br>Cluster: ${d.cluster}<br>Total Units: ${d.total}`)
//                   .style("left", (event.pageX + 10)+"px")
//                   .style("top", (event.pageY -20)+"px");
//         })
//         .on("mouseout", () => tooltip.style("display", "none"))
//         .on("click", function(event,d){
//            if(selectedDataIndices.has(d.index)){
//               selectedDataIndices.delete(d.index);
//            } else {
//               selectedDataIndices.add(d.index);
//            }
//            updateAllVisualizations();
//         });
//     })
//     .catch(error => console.error("Error in Geo Map:", error));
// }

// // -------------------------
// // Full Parallel Coordinates Plot (PCP)
// // -------------------------
// function plotFullPCP() {
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       // We focus on numerical dimensions for PCP
//       const dimensions = data.numerical_dims;
//       const items = data.items;
//       const container = d3.select("#pcp-full");
//       container.html("");
      
//       const margin = {top: 30, right: 10, bottom: 10, left: 10};
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       // Create a scale for each dimension
//       const x = d3.scalePoint()
//           .domain(dimensions)
//           .range([0, width])
//           .padding(0.5);
      
//       const yScales = {};
//       dimensions.forEach(dim => {
//         const values = items.map(d => +d[dim]);
//         yScales[dim] = d3.scaleLinear()
//           .domain([d3.min(values), d3.max(values)])
//           .range([height, 0]);
//       });
      
//       // Draw axes for each dimension
//       dimensions.forEach(dim => {
//         svg.append("g")
//           .attr("class", "axis")
//           .attr("transform", `translate(${x(dim)},0)`)
//           .call(d3.axisLeft(yScales[dim]).ticks(5))
//           .append("text")
//           .attr("y", -9)
//           .attr("text-anchor", "middle")
//           .attr("fill", "#000")
//           .text(dim);
//       });
      
//       // Draw polylines for each item
//       svg.selectAll(".line")
//         .data(items)
//         .enter().append("path")
//         .attr("class", d=> selectedDataIndices.has(d.index) ? "selected" : "line")
//         .attr("d", function(d) {
//           return d3.line()(dimensions.map(dim => [ x(dim), yScales[dim](+d[dim]) ]));
//         })
//         .attr("stroke", d => d3.schemeCategory10[d.cluster % 10])
//         .attr("fill", "none")
//         .attr("stroke-opacity", 0.5)
//         .on("mouseover", function(event,d){
//           tooltip.style("display", "block")
//                  .html(`Cluster: ${d.cluster}<br>Borough: ${d["Borough"]}`)
//                  .style("left", (event.pageX + 10)+"px")
//                  .style("top", (event.pageY -20)+"px");
//         })
//         .on("mouseout", ()=> tooltip.style("display", "none"))
//         .on("click", function(event,d){
//           // Toggle selection
//           if(selectedDataIndices.has(d.index)){
//             selectedDataIndices.delete(d.index);
//           } else {
//             selectedDataIndices.add(d.index);
//           }
//           updateAllVisualizations();
//         });
//     })
//     .catch(error => console.error("Error in Full PCP:", error));
// }

// // -------------------------
// // Scatterplot Matrix
// // -------------------------
// function plotScatterPlotMatrix() {
//   fetch(`http://localhost:5001/scatterplot_matrix?dim_index=${selectedDim}&k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const features = data.features;
//       const pairs = data.pairs;
//       const container = d3.select("#scatterplot-matrix");
//       container.html("");
//       const size = 150;
//       const padding = 20;
//       const svg = container.append("svg")
//           .attr("width", size * features.length)
//           .attr("height", size * features.length);
      
//       features.forEach((xFeat, i) => {
//         features.forEach((yFeat, j) => {
//           const cell = svg.append("g")
//               .attr("transform", `translate(${i*size},${j*size})`);
//           cell.append("rect")
//               .attr("width", size)
//               .attr("height", size)
//               .attr("fill", "#f8f9fa")
//               .attr("stroke", "#ccc");
          
//           if (i === j) {
//             cell.append("text")
//                 .attr("x", size/2)
//                 .attr("y", size/2)
//                 .attr("dy", ".35em")
//                 .attr("text-anchor", "middle")
//                 .text(xFeat)
//                 .attr("font-size", "10px");
//           } else {
//             const xExtent = d3.extent(pairs, d => +d[xFeat]);
//             const yExtent = d3.extent(pairs, d => +d[yFeat]);
//             const xScale = d3.scaleLinear().domain(xExtent).range([padding, size-padding]);
//             const yScale = d3.scaleLinear().domain(yExtent).range([size-padding, padding]);
//             cell.selectAll("circle")
//               .data(pairs)
//               .enter().append("circle")
//               .attr("cx", d => xScale(+d[xFeat]))
//               .attr("cy", d => yScale(+d[yFeat]))
//               .attr("r", 2)
//               .attr("fill", d => d3.schemeCategory10[d.cluster % 10])
//               .on("mouseover", function(event,d){
//                 tooltip.style("display", "block")
//                        .html(`${xFeat}: ${+d[xFeat].toFixed(2)}<br>${yFeat}: ${+d[yFeat].toFixed(2)}<br>Cluster: ${d.cluster}`)
//                        .style("left", (event.pageX + 10)+"px")
//                        .style("top", (event.pageY -20)+"px");
//               })
//               .on("mouseout", ()=> tooltip.style("display", "none"))
//               .on("click", function(event,d){
//                 // Toggle selection for scatter matrix is implemented similarly
//                 if(selectedDataIndices.has(d.index)){
//                   selectedDataIndices.delete(d.index);
//                 } else {
//                   selectedDataIndices.add(d.index);
//                 }
//                 updateAllVisualizations();
//               });
//           }
//         });
//       });
//     })
//     .catch(error => console.error("Error in Scatterplot Matrix:", error));
// }

// // -------------------------
// // Bar Chart (Units by Income Level)
// // -------------------------
// function updateBarChart() {
//   // This function computes sums for income categories and updates the bar chart.
//   const incomeCategories = [
//     "Extremely Low Income Units", 
//     "Very Low Income Units", 
//     "Low Income Units",
//     "Moderate Income Units", 
//     "Middle Income Units", 
//     "Other Income Units"
//   ];
  
//   // For simplicity, fetch full pcp data and sum across items.
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const items = data.items;
//       // If selection exists, filter; else use all items.
//       const filtered = items.filter((d, i) => {
//         return selectedDataIndices.size === 0 ? true : selectedDataIndices.has(i);
//       });
//       const sums = {};
//       incomeCategories.forEach(cat => {
//         sums[cat] = d3.sum(filtered, d => +d[cat]);
//       });
//       const container = d3.select("#bar-chart");
//       container.html("");
//       const margin = {top: 30, right: 20, bottom: 70, left: 50};
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       const x = d3.scaleBand()
//           .domain(incomeCategories)
//           .range([0,width])
//           .padding(0.2);
      
//       const y = d3.scaleLinear()
//           .domain([0, d3.max(Object.values(sums))])
//           .nice()
//           .range([height,0]);
      
//       svg.append("g")
//          .attr("transform", `translate(0,${height})`)
//          .call(d3.axisBottom(x))
//          .selectAll("text")
//          .attr("transform", "rotate(-45)")
//          .style("text-anchor", "end")
//          .style("font-size", "8px");
      
//       svg.append("g")
//          .attr("class", "y-axis")
//          .call(d3.axisLeft(y));
      
//       svg.selectAll(".bar")
//          .data(incomeCategories)
//          .enter()
//          .append("rect")
//          .attr("class", "bar")
//          .attr("x", d => x(d))
//          .attr("y", d => y(sums[d]))
//          .attr("width", x.bandwidth())
//          .attr("height", d => height - y(sums[d]))
//          .attr("fill", "#3498db")
//          .on("mouseover", function(event,d) {
//             tooltip.style("display", "block")
//                    .html(`${d}<br>Units: ${sums[d]}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY - 20)+"px");
//          })
//          .on("mouseout", function() { tooltip.style("display", "none"); });
      
//       svg.append("text")
//          .attr("x", width/2)
//          .attr("y", -10)
//          .attr("text-anchor", "middle")
//          .style("font-size", "12px")
//          .style("font-weight", "bold")
//          .text("Units by Income Level");
//     })
//     .catch(error => console.error("Error in Bar Chart:", error));
// }

// // Initial load
// document.addEventListener('DOMContentLoaded', updateAllVisualizations);


// // Global state variables
// let selectedDim = 2;
// let currentK = 3;
// let selectedDataIndices = new Set();  // for brushing/selection

// // Update slider labels
// const dimSlider = document.getElementById("dimension-slider");
// const clusterSlider = document.getElementById("cluster-slider");
// const dimValue = document.getElementById("dim-value");
// const clusterValue = document.getElementById("cluster-value");
// const resetBtn = document.getElementById("reset-btn");

// dimSlider.addEventListener("input", function() {
//   selectedDim = +this.value;
//   dimValue.textContent = this.value;
//   updateAllVisualizations();
// });

// clusterSlider.addEventListener("input", function() {
//   currentK = +this.value;
//   clusterValue.textContent = this.value;
//   updateAllVisualizations();
// });

// resetBtn.addEventListener("click", function() {
//   selectedDataIndices.clear();
//   updateAllVisualizations();
// });

// // Global tooltip
// const tooltip = d3.select("#tooltip");

// // Update all visualizations when parameters or selections change
// function updateAllVisualizations() {
//   plotScreePlot();
//   plotBiplot();
//   plotDataMDS();
//   plotGeoMap();
//   plotFullPCP();
//   plotScatterPlotMatrix();
//   updateBarChart();
//   plotSankey();
//   plotRadar();  // NEW: update radar plot
// }

// // -------------------------
// // PCA Scree Plot
// // -------------------------
// function plotScreePlot() {
//   fetch('http://localhost:5001/pca')
//     .then(response => response.json())
//     .then(data => {
//       const eigenvalues = data.eigenvalues;
//       const cumulative = data.cumulative_variance;
//       const margin = {top: 20, right: 20, bottom: 40, left: 50};
//       const container = d3.select("#scree-plot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

//       const svg = container.append("svg")
//         .attr("width", width+margin.left+margin.right)
//         .attr("height", height+margin.top+margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//       const x = d3.scaleBand()
//         .domain(eigenvalues.map((_,i) => "PC " + (i+1)))
//         .range([0,width])
//         .padding(0.2);

//       const y = d3.scaleLinear()
//         .domain([0, d3.max(eigenvalues)])
//         .nice()
//         .range([height,0]);

//       svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x));

//       svg.append("g")
//         .call(d3.axisLeft(y));

//       svg.selectAll(".bar")
//         .data(eigenvalues)
//         .enter()
//         .append("rect")
//         .attr("class", "bar")
//         .attr("x", (_,i)=> x("PC " + (i+1)))
//         .attr("y", d => y(d))
//         .attr("width", x.bandwidth())
//         .attr("height", d => height - y(d))
//         .attr("fill", (_,i)=> i === selectedDim-1 ? "#e74c3c" : "#3498db")
//         .on("mouseover", function(event,d,i) {
//           tooltip.style("display", "block")
//                  .html(`PC ${i+1}<br>Variance: ${d.toFixed(2)}<br>Cumulative: ${(cumulative[i]*100).toFixed(1)}%`)
//                  .style("left", (event.pageX + 10) + "px")
//                  .style("top", (event.pageY - 20) + "px");
//         })
//         .on("mouseout", function() { tooltip.style("display", "none"); })
//         .on("click", function(event,d,i) {
//           selectedDim = i+1;
//           dimSlider.value = selectedDim;
//           dimValue.textContent = selectedDim;
//           updateAllVisualizations();
//         });

//       // Draw cumulative variance line
//       const line = d3.line()
//         .x((d,i)=> x("PC " + (i+1)) + x.bandwidth()/2)
//         .y(d=> y(d * d3.max(eigenvalues)));

//       svg.append("path")
//         .datum(cumulative)
//         .attr("fill", "none")
//         .attr("stroke", "#000")
//         .attr("stroke-width", 2)
//         .attr("d", line);
//     })
//     .catch(error => console.error("Error in Scree Plot:", error));
// }

// // -------------------------
// // PCA Biplot
// // -------------------------
// function plotBiplot() {
//   fetch(`http://localhost:5001/biplot?pc1=0&pc2=1&k=${currentK}&dim=${selectedDim}`)
//     .then(response => response.json())
//     .then(data => {
//       const margin = {top: 20, right: 20, bottom: 40, left: 50};
//       const container = d3.select("#biplot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);

//       // Scales for PCA space
//       const x = d3.scaleLinear()
//           .domain(d3.extent(data.points.x))
//           .range([0, width]);
//       const y = d3.scaleLinear()
//           .domain(d3.extent(data.points.y))
//           .range([height, 0]);

//       svg.append("g")
//           .attr("transform", `translate(0,${height})`)
//           .call(d3.axisBottom(x));
//       svg.append("g")
//           .call(d3.axisLeft(y));

//       // Draw points
//       svg.selectAll(".point")
//           .data(data.points.x.map((d, i) => ({x: d, y: data.points.y[i], cluster: data.points.clusters[i], index: i})))
//           .enter().append("circle")
//           .attr("class", d=> selectedDataIndices.has(d.index) ? "selected" : "")
//           .attr("cx", d => x(d.x))
//           .attr("cy", d => y(d.y))
//           .attr("r", 3)
//           .attr("fill", d => d3.schemeCategory10[d.cluster % 10])
//           .on("mouseover", function(event,d) {
//             tooltip.style("display", "block")
//                    .html(`Cluster: ${d.cluster}`)
//                    .style("left", (event.pageX + 10) + "px")
//                    .style("top", (event.pageY - 20) + "px");
//           })
//           .on("mouseout", () => tooltip.style("display", "none"))
//           .on("click", function(event,d) {
//             if(selectedDataIndices.has(d.index)){
//               selectedDataIndices.delete(d.index);
//             } else {
//               selectedDataIndices.add(d.index);
//             }
//             updateAllVisualizations();
//           });

//       // Draw loading vectors (arrows)
//       const loadingScale = Math.min(width, height) * 0.4;
//       svg.selectAll(".loading")
//           .data(data.loadings.x.map((d,i)=> ({x: d, y: data.loadings.y[i], feature: data.features[i]})))
//           .enter().append("line")
//           .attr("x1", x(0))
//           .attr("y1", y(0))
//           .attr("x2", d => x(d.x * loadingScale))
//           .attr("y2", d => y(d.y * loadingScale))
//           .attr("stroke", "red")
//           .attr("stroke-width", 1);
//       svg.selectAll(".loading-label")
//           .data(data.loadings.x.map((d,i)=> ({x: d, y: data.loadings.y[i], feature: data.features[i]})))
//           .enter().append("text")
//           .attr("x", d => x(d.x * loadingScale * 1.1))
//           .attr("y", d => y(d.y * loadingScale * 1.1))
//           .text(d => d.feature)
//           .attr("font-size", "10px")
//           .attr("text-anchor", "middle");
//     })
//     .catch(error => console.error("Error in Biplot:", error));
// }

// // -------------------------
// // Data MDS Plot
// // -------------------------
// function plotDataMDS() {
//   fetch(`http://localhost:5001/data_mds?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const margin = {top: 20, right: 20, bottom: 20, left: 20};
//       const container = d3.select("#dataMDS");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       const x = d3.scaleLinear()
//           .domain(d3.extent(data.x))
//           .range([0,width]);
//       const y = d3.scaleLinear()
//           .domain(d3.extent(data.y))
//           .range([height,0]);
      
//       svg.append("g")
//           .attr("transform", `translate(0,${height})`)
//           .call(d3.axisBottom(x));
//       svg.append("g")
//           .call(d3.axisLeft(y));
      
//       svg.selectAll(".mds-point")
//           .data(data.x.map((d,i)=> ({x: d, y: data.y[i], cluster: data.clusters[i], index: i})))
//           .enter().append("circle")
//           .attr("class", d=> selectedDataIndices.has(d.index) ? "selected" : "")
//           .attr("cx", d=> x(d.x))
//           .attr("cy", d=> y(d.y))
//           .attr("r", 3)
//           .attr("fill", d=> d3.schemeCategory10[d.cluster % 10])
//           .on("mouseover", function(event,d){
//             tooltip.style("display", "block")
//                    .html(`Cluster: ${d.cluster}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY -20)+"px");
//           })
//           .on("mouseout", () => tooltip.style("display", "none"))
//           .on("click", function(event,d){
//             if(selectedDataIndices.has(d.index)){
//               selectedDataIndices.delete(d.index);
//             } else {
//               selectedDataIndices.add(d.index);
//             }
//             updateAllVisualizations();
//           });
//     })
//     .catch(error => console.error("Error in Data MDS:", error));
// }

// // -------------------------
// // Geo Map Plot
// // -------------------------
// function plotGeoMap() {
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const items = data.items.filter(d => d.Latitude && d.Longitude);
//       const margin = {top: 10, right: 10, bottom: 10, left: 10};
//       const container = d3.select("#geo-map");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       // Use d3.geoMercator with NYC centered and scaled.
//       const projection = d3.geoMercator()
//             .center([-73.95, 40.7])
//             .scale(60000)
//             .translate([width/2, height/2]);
      
//       // Draw circles for each building
//       svg.selectAll(".geo-point")
//         .data(items.map((d,i)=> ({ 
//           coordinates: [ +d.Longitude, +d.Latitude ],
//           cluster: d.cluster,
//           index: i,
//           borough: d["Borough"],
//           total: +d["Total Units"]
//         })))
//         .enter().append("circle")
//         .attr("cx", d=> projection(d.coordinates)[0])
//         .attr("cy", d=> projection(d.coordinates)[1])
//         .attr("r", d=> Math.sqrt(d.total)/2)
//         .attr("fill", d=> d3.schemeCategory10[d.cluster % 10])
//         .attr("stroke", "#fff")
//         .attr("stroke-width", 0.5)
//         .on("mouseover", function(event,d){
//            tooltip.style("display", "block")
//                   .html(`Borough: ${d.borough}<br>Cluster: ${d.cluster}<br>Total Units: ${d.total}`)
//                   .style("left", (event.pageX + 10)+"px")
//                   .style("top", (event.pageY -20)+"px");
//         })
//         .on("mouseout", () => tooltip.style("display", "none"))
//         .on("click", function(event,d){
//            if(selectedDataIndices.has(d.index)){
//               selectedDataIndices.delete(d.index);
//            } else {
//               selectedDataIndices.add(d.index);
//            }
//            updateAllVisualizations();
//         });
//     })
//     .catch(error => console.error("Error in Geo Map:", error));
// }

// // -------------------------
// // Full Parallel Coordinates Plot (PCP)
// // -------------------------
// function plotFullPCP() {
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       // Use numerical dimensions for PCP
//       const dimensions = data.numerical_dims;
//       const items = data.items;
//       const container = d3.select("#pcp-full");
//       container.html("");
      
//       const margin = {top: 30, right: 10, bottom: 10, left: 10};
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       // Create scale for each dimension
//       const x = d3.scalePoint()
//           .domain(dimensions)
//           .range([0, width])
//           .padding(0.5);
      
//       const yScales = {};
//       dimensions.forEach(dim => {
//         const values = items.map(d => +d[dim]);
//         yScales[dim] = d3.scaleLinear()
//           .domain([d3.min(values), d3.max(values)])
//           .range([height, 0]);
//       });
      
//       // Draw axes for each dimension
//       dimensions.forEach(dim => {
//         svg.append("g")
//           .attr("class", "axis")
//           .attr("transform", `translate(${x(dim)},0)`)
//           .call(d3.axisLeft(yScales[dim]).ticks(5))
//           .append("text")
//           .attr("y", -9)
//           .attr("text-anchor", "middle")
//           .attr("fill", "#000")
//           .text(dim);
//       });
      
//       // Draw polylines for each item
//       svg.selectAll(".line")
//         .data(items)
//         .enter().append("path")
//         .attr("class", d=> selectedDataIndices.has(d.index) ? "selected" : "line")
//         .attr("d", function(d) {
//           return d3.line()(dimensions.map(dim => [ x(dim), yScales[dim](+d[dim]) ]));
//         })
//         .attr("stroke", d => d3.schemeCategory10[d.cluster % 10])
//         .attr("fill", "none")
//         .attr("stroke-opacity", 0.5)
//         .on("mouseover", function(event,d){
//           tooltip.style("display", "block")
//                  .html(`Cluster: ${d.cluster}<br>Borough: ${d["Borough"]}`)
//                  .style("left", (event.pageX + 10)+"px")
//                  .style("top", (event.pageY -20)+"px");
//         })
//         .on("mouseout", ()=> tooltip.style("display", "none"))
//         .on("click", function(event,d){
//           if(selectedDataIndices.has(d.index)){
//             selectedDataIndices.delete(d.index);
//           } else {
//             selectedDataIndices.add(d.index);
//           }
//           updateAllVisualizations();
//         });
//     })
//     .catch(error => console.error("Error in Full PCP:", error));
// }

// // -------------------------
// // Scatterplot Matrix
// // -------------------------
// function plotScatterPlotMatrix() {
//   fetch(`http://localhost:5001/scatterplot_matrix?dim_index=${selectedDim}&k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const features = data.features;
//       const pairs = data.pairs;
//       const container = d3.select("#scatterplot-matrix");
//       container.html("");
//       const size = 150;
//       const padding = 20;
//       const svg = container.append("svg")
//           .attr("width", size * features.length)
//           .attr("height", size * features.length);
      
//       features.forEach((xFeat, i) => {
//         features.forEach((yFeat, j) => {
//           const cell = svg.append("g")
//               .attr("transform", `translate(${i*size},${j*size})`);
//           cell.append("rect")
//               .attr("width", size)
//               .attr("height", size)
//               .attr("fill", "#f8f9fa")
//               .attr("stroke", "#ccc");
          
//           if (i === j) {
//             cell.append("text")
//                 .attr("x", size/2)
//                 .attr("y", size/2)
//                 .attr("dy", ".35em")
//                 .attr("text-anchor", "middle")
//                 .text(xFeat)
//                 .attr("font-size", "10px");
//           } else {
//             const xExtent = d3.extent(pairs, d => +d[xFeat]);
//             const yExtent = d3.extent(pairs, d => +d[yFeat]);
//             const xScale = d3.scaleLinear().domain(xExtent).range([padding, size-padding]);
//             const yScale = d3.scaleLinear().domain(yExtent).range([size-padding, padding]);
//             cell.selectAll("circle")
//               .data(pairs)
//               .enter().append("circle")
//               .attr("cx", d => xScale(+d[xFeat]))
//               .attr("cy", d => yScale(+d[yFeat]))
//               .attr("r", 2)
//               .attr("fill", d => d3.schemeCategory10[d.cluster % 10])
//               .on("mouseover", function(event,d){
//                 tooltip.style("display", "block")
//                        .html(`${xFeat}: ${+d[xFeat].toFixed(2)}<br>${yFeat}: ${+d[yFeat].toFixed(2)}<br>Cluster: ${d.cluster}`)
//                        .style("left", (event.pageX + 10)+"px")
//                        .style("top", (event.pageY -20)+"px");
//               })
//               .on("mouseout", ()=> tooltip.style("display", "none"))
//               .on("click", function(event,d){
//                 if(selectedDataIndices.has(d.index)){
//                   selectedDataIndices.delete(d.index);
//                 } else {
//                   selectedDataIndices.add(d.index);
//                 }
//                 updateAllVisualizations();
//               });
//           }
//         });
//       });
//     })
//     .catch(error => console.error("Error in Scatterplot Matrix:", error));
// }

// // -------------------------
// // Bar Chart (Units by Income Level)
// // -------------------------
// function updateBarChart() {
//   const incomeCategories = [
//     "Extremely Low Income Units", 
//     "Very Low Income Units", 
//     "Low Income Units",
//     "Moderate Income Units", 
//     "Middle Income Units", 
//     "Other Income Units"
//   ];
  
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const items = data.items;
//       const filtered = items.filter((d, i) => {
//         return selectedDataIndices.size === 0 ? true : selectedDataIndices.has(i);
//       });
//       const sums = {};
//       incomeCategories.forEach(cat => {
//         sums[cat] = d3.sum(filtered, d => +d[cat]);
//       });
//       const container = d3.select("#bar-chart");
//       container.html("");
//       const margin = {top: 30, right: 20, bottom: 70, left: 50};
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       const x = d3.scaleBand()
//           .domain(incomeCategories)
//           .range([0,width])
//           .padding(0.2);
      
//       const y = d3.scaleLinear()
//           .domain([0, d3.max(Object.values(sums))])
//           .nice()
//           .range([height,0]);
      
//       svg.append("g")
//          .attr("transform", `translate(0,${height})`)
//          .call(d3.axisBottom(x))
//          .selectAll("text")
//          .attr("transform", "rotate(-45)")
//          .style("text-anchor", "end")
//          .style("font-size", "8px");
      
//       svg.append("g")
//          .attr("class", "y-axis")
//          .call(d3.axisLeft(y));
      
//       svg.selectAll(".bar")
//          .data(incomeCategories)
//          .enter()
//          .append("rect")
//          .attr("class", "bar")
//          .attr("x", d => x(d))
//          .attr("y", d => y(sums[d]))
//          .attr("width", x.bandwidth())
//          .attr("height", d => height - y(sums[d]))
//          .attr("fill", "#3498db")
//          .on("mouseover", function(event,d) {
//             tooltip.style("display", "block")
//                    .html(`${d}<br>Units: ${sums[d]}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY - 20)+"px");
//          })
//          .on("mouseout", function() { tooltip.style("display", "none"); });
      
//       svg.append("text")
//          .attr("x", width/2)
//          .attr("y", -10)
//          .attr("text-anchor", "middle")
//          .style("font-size", "12px")
//          .style("font-weight", "bold")
//          .text("Units by Income Level");
//     })
//     .catch(error => console.error("Error in Bar Chart:", error));
// }

// // -------------------------
// // Sankey Diagram
// // -------------------------
// function plotSankey() {
//   fetch("http://localhost:5001/sankey_data")
//     .then(response => response.json())
//     .then(data => {
//       const margin = {top: 10, right: 10, bottom: 10, left: 10};
//       const container = d3.select("#sankey-plot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       // Initialize sankey generator
//       const sankeyGenerator = d3.sankey()
//           .nodeWidth(15)
//           .nodePadding(10)
//           .size([width, height]);
      
//       // Compute sankey layout
//       const sankeyData = sankeyGenerator({
//         nodes: data.nodes.map(d => Object.assign({}, d)),
//         links: data.links.map(d => Object.assign({}, d))
//       });
      
//       // Draw links
//       svg.append("g")
//          .selectAll("path")
//          .data(sankeyData.links)
//          .enter().append("path")
//          .attr("d", d3.sankeyLinkHorizontal())
//          .attr("fill", "none")
//          .attr("stroke", "#ccc")
//          .attr("stroke-opacity", 0.5)
//          .attr("stroke-width", d => Math.max(1, d.width))
//          .on("mouseover", function(event,d){
//             tooltip.style("display", "block")
//                    .html(`Flow: ${d.value}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY - 20)+"px");
//          })
//          .on("mouseout", function(){
//             tooltip.style("display", "none");
//          });
      
//       // Draw nodes
//       const node = svg.append("g")
//          .selectAll(".node")
//          .data(sankeyData.nodes)
//          .enter().append("g")
//          .attr("class", "node");
      
//       node.append("rect")
//          .attr("x", d => d.x0)
//          .attr("y", d => d.y0)
//          .attr("height", d => d.y1 - d.y0)
//          .attr("width", d => d.x1 - d.x0)
//          .attr("fill", "#0f52ba")
//          .attr("stroke", "#fff")
//          .on("mouseover", function(event,d){
//             tooltip.style("display", "block")
//                    .html(`${d.name}<br>Value: ${d.value || 0}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY - 20)+"px");
//          })
//          .on("mouseout", function(){ tooltip.style("display", "none"); });
      
//       node.append("text")
//          .attr("x", d => d.x0 - 6)
//          .attr("y", d => (d.y1 + d.y0)/2)
//          .attr("dy", "0.35em")
//          .attr("text-anchor", "end")
//          .text(d => d.name)
//          .filter(d => d.x0 < width / 2)
//          .attr("x", d => d.x1 + 6)
//          .attr("text-anchor", "start");
//     })
//     .catch(error => console.error("Error in Sankey Plot:", error));
// }

// // -------------------------
// // Radar Plot
// // -------------------------
// function plotRadar() {
//   // We'll use the full PCP data to compute average values for numeric dimensions.
//   fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
//     .then(response => response.json())
//     .then(data => {
//       const numericalDims = data.numerical_dims;
//       const items = data.items;
      
//       // Use the filtered set if any selections exist
//       const filtered = items.filter((d, i) => {
//         return selectedDataIndices.size === 0 ? true : selectedDataIndices.has(i);
//       });
      
//       // Compute average for each numerical dimension
//       const avgData = numericalDims.map(dim => {
//         const vals = filtered.map(d => +d[dim]);
//         return { dimension: dim, average: d3.mean(vals) };
//       });
      
//       // Also compute global min and max (for normalization)
//       const globalAverages = numericalDims.map(dim => {
//         const vals = items.map(d => +d[dim]);
//         return { dimension: dim, min: d3.min(vals), max: d3.max(vals) };
//       });
      
//       // Build a dictionary for min-max lookup by dimension
//       const minMax = {};
//       globalAverages.forEach(d => {
//         minMax[d.dimension] = { min: d.min, max: d.max };
//       });
      
//       // Set up radar plot dimensions
//       const margin = {top: 50, right: 50, bottom: 50, left: 50};
//       const container = d3.select("#radar-plot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
//       const radius = Math.min(width, height) / 2;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${(width+margin.left+margin.right)/2},${(height+margin.top+margin.bottom)/2})`);
      
//       // Number of axes equals the number of dimensions
//       const total = numericalDims.length;
//       const angleSlice = (Math.PI * 2) / total;
      
//       // Scale for radius (for each axis, normalize average value between 0 and radius)
//       const rScale = {};
//       numericalDims.forEach(dim => {
//         rScale[dim] = d3.scaleLinear()
//                         .domain([minMax[dim].min, minMax[dim].max])
//                         .range([0, radius]);
//       });
      
//       // Draw grid circles and axis lines
//       const levels = 5;
//       for (let level = 1; level <= levels; level++) {
//         const rLevel = radius * level / levels;
//         svg.append("circle")
//            .attr("r", rLevel)
//            .attr("fill", "none")
//            .attr("stroke", "#ccc")
//            .attr("stroke-opacity", 0.5);
//       }
      
//       numericalDims.forEach((dim, i) => {
//         const angle = i * angleSlice - Math.PI/2;
//         const lineCoord = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
//         svg.append("line")
//            .attr("x1", 0)
//            .attr("y1", 0)
//            .attr("x2", lineCoord.x)
//            .attr("y2", lineCoord.y)
//            .attr("stroke", "#ccc")
//            .attr("stroke-width", 1);
           
//         // Axis label
//         const labelOffset = 10;
//         svg.append("text")
//            .attr("x", Math.cos(angle) * (radius + labelOffset))
//            .attr("y", Math.sin(angle) * (radius + labelOffset))
//            .attr("text-anchor", "middle")
//            .attr("font-size", "10px")
//            .text(dim);
//       });
      
//       // Build radar line path using the average data
//       const radarLine = d3.lineRadial()
//                           .radius(d => rScale[d.dimension](d.average))
//                           .angle((d, i) => i * angleSlice)
//                           .curve(d3.curveLinearClosed);
      
//       // Draw the radar area (polygon)
//       svg.append("path")
//          .datum(avgData)
//          .attr("d", radarLine)
//          .attr("fill", "#3498db")
//          .attr("fill-opacity", 0.5)
//          .attr("stroke", "#2980b9")
//          .attr("stroke-width", 2);
      
//       // Optionally, draw circles at the vertices
//       svg.selectAll(".radarCircle")
//          .data(avgData)
//          .enter().append("circle")
//          .attr("class", "radarCircle")
//          .attr("r", 3)
//          .attr("cx", (d, i) => Math.cos(i * angleSlice - Math.PI/2) * rScale[d.dimension](d.average))
//          .attr("cy", (d, i) => Math.sin(i * angleSlice - Math.PI/2) * rScale[d.dimension](d.average))
//          .attr("fill", "#fff")
//          .attr("stroke", "#2980b9")
//          .attr("stroke-width", 2)
//          .on("mouseover", function(event,d) {
//            tooltip.style("display", "block")
//                   .html(`${d.dimension}<br>Average: ${d.average.toFixed(2)}`)
//                   .style("left", (event.pageX + 10)+"px")
//                   .style("top", (event.pageY -20)+"px");
//          })
//          .on("mouseout", function() {
//            tooltip.style("display", "none");
//          });
//     })
//     .catch(error => console.error("Error in Radar Plot:", error));
// }

// // -------------------------
// // Sankey Diagram
// // -------------------------
// function plotSankey() {
//   fetch("http://localhost:5001/sankey_data")
//     .then(response => response.json())
//     .then(data => {
//       const margin = {top: 10, right: 10, bottom: 10, left: 10};
//       const container = d3.select("#sankey-plot");
//       container.html("");
//       const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
//       const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      
//       const svg = container.append("svg")
//           .attr("width", width+margin.left+margin.right)
//           .attr("height", height+margin.top+margin.bottom)
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);
      
//       // Initialize sankey generator
//       const sankeyGenerator = d3.sankey()
//           .nodeWidth(15)
//           .nodePadding(10)
//           .size([width, height]);
      
//       const sankeyData = sankeyGenerator({
//         nodes: data.nodes.map(d => Object.assign({}, d)),
//         links: data.links.map(d => Object.assign({}, d))
//       });
      
//       svg.append("g")
//          .selectAll("path")
//          .data(sankeyData.links)
//          .enter().append("path")
//          .attr("d", d3.sankeyLinkHorizontal())
//          .attr("fill", "none")
//          .attr("stroke", "#ccc")
//          .attr("stroke-opacity", 0.5)
//          .attr("stroke-width", d => Math.max(1, d.width))
//          .on("mouseover", function(event,d){
//             tooltip.style("display", "block")
//                    .html(`Flow: ${d.value}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY - 20)+"px");
//          })
//          .on("mouseout", function(){
//             tooltip.style("display", "none");
//          });
      
//       const node = svg.append("g")
//          .selectAll(".node")
//          .data(sankeyData.nodes)
//          .enter().append("g")
//          .attr("class", "node");
      
//       node.append("rect")
//          .attr("x", d => d.x0)
//          .attr("y", d => d.y0)
//          .attr("height", d => d.y1 - d.y0)
//          .attr("width", d => d.x1 - d.x0)
//          .attr("fill", "#0f52ba")
//          .attr("stroke", "#fff")
//          .on("mouseover", function(event,d){
//             tooltip.style("display", "block")
//                    .html(`${d.name}<br>Value: ${d.value || 0}`)
//                    .style("left", (event.pageX + 10)+"px")
//                    .style("top", (event.pageY - 20)+"px");
//          })
//          .on("mouseout", function(){ tooltip.style("display", "none"); });
      
//       node.append("text")
//          .attr("x", d => d.x0 - 6)
//          .attr("y", d => (d.y1 + d.y0)/2)
//          .attr("dy", "0.35em")
//          .attr("text-anchor", "end")
//          .text(d => d.name)
//          .filter(d => d.x0 < width / 2)
//          .attr("x", d => d.x1 + 6)
//          .attr("text-anchor", "start");
//     })
//     .catch(error => console.error("Error in Sankey Plot:", error));
// }

// // -------------------------
// // Radar Plot
// // -------------------------
// // (See function plotRadar() above)
  
// // -------------------------
// // Initial load
// // -------------------------
// document.addEventListener('DOMContentLoaded', updateAllVisualizations);
// Global variables
const API_BASE_URL = 'http://localhost:5001';
let selectedBorough = 'all';
let selectedConstructionType = 'all';
let yearRange = [2000, 2025];
let currentK = 3;
let selectedDimension = 2;
let filteredData = null;

// Create tooltip
const tooltip = d3.select('#tooltip');

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Initialize filters
    initializeFilters();
    
    // Load all visualizations
    loadAllVisualizations();
    
    // Add event listeners for filters
    document.getElementById('borough-filter').addEventListener('change', updateFilters);
    document.getElementById('construction-filter').addEventListener('change', updateFilters);
    document.getElementById('year-min').addEventListener('input', updateYearRange);
    document.getElementById('year-max').addEventListener('input', updateYearRange);
    
    // Reset PCP button
    document.getElementById('reset-pcp').addEventListener('click', resetPCPBrushes);
});

// Initialize filters with data from the backend
function initializeFilters() {
    // Fetch construction types
    fetch(`${API_BASE_URL}/full_pcp_data`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            // Get unique construction types
            const constructionTypes = [...new Set(data.items.map(item => item['Construction Type']))];
            const constructionSelect = document.getElementById('construction-filter');
            
            constructionTypes.forEach(type => {
                if (type && type !== 'Unknown') {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    constructionSelect.appendChild(option);
                }
            });
        })
        .catch(error => console.error('Error loading construction types:', error));
}

// Update filters and refresh visualizations
function updateFilters() {
    selectedBorough = document.getElementById('borough-filter').value;
    selectedConstructionType = document.getElementById('construction-filter').value;
    
    // Reload visualizations with new filters
    loadAllVisualizations();
}

// Update year range display and filters
function updateYearRange() {
    const minYear = parseInt(document.getElementById('year-min').value);
    const maxYear = parseInt(document.getElementById('year-max').value);
    
    // Ensure min doesn't exceed max
    if (minYear > maxYear) {
        if (this.id === 'year-min') {
            document.getElementById('year-min').value = maxYear;
        } else {
            document.getElementById('year-max').value = minYear;
        }
    }
    
    // Update display and global variable
    const minDisplay = document.getElementById('year-min').value;
    const maxDisplay = document.getElementById('year-max').value;
    document.getElementById('year-display').textContent = `${minDisplay}-${maxDisplay}`;
    
    yearRange = [parseInt(minDisplay), parseInt(maxDisplay)];
    
    // Debounce to prevent too many updates
    debounce(() => loadAllVisualizations(), 300)();
}

// Reset PCP brushes
function resetPCPBrushes() {
    // Implementation depends on how PCP is created
    // This will be implemented in the PCP visualization function
    loadParallelCoordinates();
}

// Load all visualizations
function loadAllVisualizations() {
    loadBarChartByBorough();
    loadPieCharts();
    loadGeoMap();
    loadSankeyDiagram();
    loadScreePlot();
    loadBiplot();
    loadMDSClustering();
    loadParallelCoordinates();
    loadScatterplotMatrix();
    loadRadarChart();
}

// Load bar chart showing units by borough
function loadBarChartByBorough() {
    fetch(`${API_BASE_URL}/borough_units`)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Invalid data format');
            
            // Filter data if borough is selected
            if (selectedBorough !== 'all') {
                data = data.filter(d => d.Borough === selectedBorough);
            }
            
            // Set up dimensions
            const margin = {top: 20, right: 20, bottom: 60, left: 60};
            const width = document.getElementById('borough-chart').clientWidth - margin.left - margin.right;
            const height = document.getElementById('borough-chart').clientHeight - margin.top - margin.bottom;
            
            // Clear previous chart
            d3.select('#borough-chart').html('');
            
            // Create SVG
            const svg = d3.select('#borough-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
                
            // Set up scales
            const x = d3.scaleBand()
                .domain(data.map(d => d.Borough))
                .range([0, width])
                .padding(0.2);
                
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d['Total Units'])])
                .range([height, 0]);
                
            // Add axes
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end');
                
            svg.append('g')
                .call(d3.axisLeft(y));
                
            // Add bars
            svg.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.Borough))
                .attr('width', x.bandwidth())
                .attr('y', d => y(d['Total Units']))
                .attr('height', d => height - y(d['Total Units']))
                .attr('fill', '#0f52ba')
                .on('mouseover', function(event, d) {
                    tooltip.style('display', 'block')
                        .html(`<strong>${d.Borough}</strong><br>Total Units: ${d['Total Units'].toLocaleString()}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.style('display', 'none');
                })
                .on('click', function(event, d) {
                    // Update borough filter and reload
                    document.getElementById('borough-filter').value = d.Borough;
                    updateFilters();
                });
        })
        .catch(error => {
            console.error('Error loading borough chart:', error);
            d3.select('#borough-chart').html(`<div class="error-message">Error loading data</div>`);
        });
}

// Load pie charts for construction type and borough distribution
function loadPieCharts() {
    fetch(`${API_BASE_URL}/pie_data`)
        .then(response => response.json())
        .then(data => {
            if (!data.construction || !data.borough) throw new Error('Invalid pie chart data');
            
            // Filter data if needed
            let constructionData = data.construction;
            let boroughData = data.borough;
            
            if (selectedBorough !== 'all') {
                constructionData = constructionData.filter(d => d.borough === selectedBorough);
            }
            
            if (selectedConstructionType !== 'all') {
                boroughData = boroughData.filter(d => d.type === selectedConstructionType);
            }
            
            // Create construction type pie chart
            createPieChart('#construction-pie', constructionData, 'type', 'count');
            
            // Create borough pie chart
            createPieChart('#borough-pie', boroughData, 'borough', 'count');
        })
        .catch(error => {
            console.error('Error loading pie charts:', error);
            d3.select('#construction-pie').html(`<div class="error-message">Error loading data</div>`);
            d3.select('#borough-pie').html(`<div class="error-message">Error loading data</div>`);
        });
}

// Helper function to create pie charts
function createPieChart(selector, data, labelKey, valueKey) {
    // Set up dimensions
    const width = document.querySelector(selector).clientWidth;
    const height = document.querySelector(selector).clientHeight;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear previous chart
    d3.select(selector).html('');
    
    // Create SVG
    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
        
    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Pie layout
    const pie = d3.pie()
        .value(d => d[valueKey])
        .sort(null);
        
    // Arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
        
    // Add arcs
    const arcs = svg.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');
        
    arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.data[labelKey]}</strong><br>${d.data[valueKey].toLocaleString()} (${(d.data[valueKey]/d3.sum(data, d => d[valueKey])*100).toFixed(1)}%)`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px');
                
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', 'scale(1.05)');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
            
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', 'scale(1)');
        })
        .on('click', function(event, d) {
            // Update filters based on selection
            if (selector === '#construction-pie') {
                document.getElementById('construction-filter').value = d.data[labelKey];
            } else if (selector === '#borough-pie') {
                document.getElementById('borough-filter').value = d.data[labelKey];
            }
            updateFilters();
        });
        
    // Add legend if there's space
    if (height > 200) {
        const legend = svg.selectAll('.legend')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(${radius + 10},${-radius + 20 + i * 20})`);
            
        legend.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', (d, i) => color(i));
            
        legend.append('text')
            .attr('x', 15)
            .attr('y', 10)
            .text(d => {
                const label = d[labelKey];
                return label.length > 15 ? label.substring(0, 12) + '...' : label;
            })
            .style('font-size', '10px');
    }
}

// Load geographic map
function loadGeoMap() {
    fetch(`${API_BASE_URL}/geo_data`)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Invalid geo data format');
            
            // Filter data based on selected filters
            if (selectedBorough !== 'all') {
                data = data.filter(d => d.Borough === selectedBorough);
            }
            
            if (selectedConstructionType !== 'all') {
                data = data.filter(d => d['Construction Type'] === selectedConstructionType);
            }
            
            // Clear previous map
            const mapContainer = document.getElementById('geo-map');
            mapContainer.innerHTML = '';
            
            // Create map
            const map = L.map(mapContainer).setView([40.7128, -74.0060], 11);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Color scale for boroughs
            const boroughColors = {
                'Bronx': '#ff7f0e',
                'Brooklyn': '#1f77b4',
                'Manhattan': '#2ca02c',
                'Queens': '#d62728',
                'Staten Island': '#9467bd'
            };
            
            // Add points
            data.forEach(d => {
                const radius = Math.sqrt(d['Total Units']) * 0.8;
                const color = boroughColors[d.Borough] || '#888888';
                
                const circle = L.circleMarker([d.Latitude, d.Longitude], {
                    radius: Math.min(Math.max(radius, 3), 15),
                    fillColor: color,
                    color: '#fff',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);
                
                circle.bindPopup(`
                    <strong>Borough:</strong> ${d.Borough}<br>
                    <strong>Total Units:</strong> ${d['Total Units']}<br>
                    <strong>Construction Type:</strong> ${d['Construction Type']}<br>
                    <strong>Program:</strong> ${d['Program Group']}
                `);
            });
            
            // Add legend
            const legend = L.control({position: 'bottomright'});
            
            legend.onAdd = function(map) {
                const div = L.DomUtil.create('div', 'info legend');
                div.style.backgroundColor = 'white';
                div.style.padding = '10px';
                div.style.borderRadius = '5px';
                
                let content = '<strong>Borough</strong><br>';
                
                for (const borough in boroughColors) {
                    content += `<i style="background:${boroughColors[borough]}; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> ${borough}<br>`;
                }
                
                div.innerHTML = content;
                return div;
            };
            
            legend.addTo(map);
            
            // Fit bounds to data points
            if (data.length > 0) {
                const bounds = L.latLngBounds(data.map(d => [d.Latitude, d.Longitude]));
                map.fitBounds(bounds);
            }
        })
        .catch(error => {
            console.error('Error loading geo map:', error);
            document.getElementById('geo-map').innerHTML = `<div class="error-message">Error loading map data</div>`;
        });
}

// Load Sankey diagram
function loadSankeyDiagram() {
    fetch(`${API_BASE_URL}/sankey_data`)
        .then(response => response.json())
        .then(data => {
            if (!data.nodes || !data.links) throw new Error('Invalid Sankey data format');
            
            // Set up dimensions
            const margin = {top: 10, right: 10, bottom: 10, left: 10};
            const width = document.getElementById('sankey-diagram').clientWidth - margin.left - margin.right;
            const height = document.getElementById('sankey-diagram').clientHeight - margin.top - margin.bottom;
            
            // Clear previous chart
            d3.select('#sankey-diagram').html('');
            
            // Create SVG
            const svg = d3.select('#sankey-diagram')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
                
            // Create Sankey generator
            const sankey = d3.sankey()
                .nodeWidth(15)
                .nodePadding(10)
                .extent([[1, 1], [width - 1, height - 5]]);
                
            // Format data for Sankey
            const graph = sankey({
                nodes: data.nodes,
                links: data.links
            });
            
            // Add links
            svg.append('g')
                .selectAll('path')
                .data(graph.links)
                .join('path')
                .attr('d', d3.sankeyLinkHorizontal())
                .attr('stroke-width', d => Math.max(1, d.width))
                .attr('stroke', d => {
                    // Color based on source node
                    const sourceNode = graph.nodes[d.source.index];
                    return d3.interpolateBlues(0.2 + 0.8 * d.source.index / graph.nodes.length);
                })
                .style('fill', 'none')
                .style('stroke-opacity', 0.5)
                .on('mouseover', function(event, d) {
                    // Highlight on hover
                    d3.select(this)
                        .style('stroke-opacity', 0.8)
                        .attr('stroke-width', d => Math.max(1, d.width + 2));
                        
                    tooltip.style('display', 'block')
                        .html(`<strong>${d.source.name} → ${d.target.name}</strong><br>${d.value.toLocaleString()} units`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .style('stroke-opacity', 0.5)
                        .attr('stroke-width', d => Math.max(1, d.width));
                        
                    tooltip.style('display', 'none');
                });
                
            // Add nodes
            svg.append('g')
                .selectAll('rect')
                .data(graph.nodes)
                .join('rect')
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('height', d => d.y1 - d.y0)
                .attr('width', d => d.x1 - d.x0)
                .attr('fill', (d, i) => d3.interpolateBlues(0.2 + 0.8 * i / graph.nodes.length))
                .on('mouseover', function(event, d) {
                    tooltip.style('display', 'block')
                        .html(`<strong>${d.name}</strong><br>Total: ${d.value.toLocaleString()} units`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.style('display', 'none');
                })
                .on('click', function(event, d) {
                    // If it's a borough node, update filter
                    if (data.nodes.indexOf(d) < data.nodes.length / 2) {
                        document.getElementById('borough-filter').value = d.name;
                        updateFilters();
                    }
                });
                
            // Add labels
            svg.append('g')
                .selectAll('text')
                .data(graph.nodes)
                .join('text')
                .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
                .attr('y', d => (d.y1 + d.y0) / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
                .text(d => d.name)
                .style('font-size', '10px')
                .style('pointer-events', 'none');
        })
        .catch(error => {
            console.error('Error loading Sankey diagram:', error);
            d3.select('#sankey-diagram').html(`<div class="error-message">Error loading Sankey data</div>`);
        });
}

// Load PCA Scree Plot
function loadScreePlot() {
    fetch(`${API_BASE_URL}/pca`)
        .then(response => response.json())
        .then(data => {
            if (!data.eigenvalues || !data.cumulative_variance) throw new Error('Invalid PCA data');
            
            const eigenvalues = data.eigenvalues;
            const cumulativeVariance = data.cumulative_variance;
            
            // Set up dimensions
            const margin = {top: 40, right: 50, bottom: 60, left: 60};
            const width = document.getElementById('scree-plot').clientWidth - margin.left - margin.right;
            const height = document.getElementById('scree-plot').clientHeight - margin.top - margin.bottom;
            
            // Clear previous chart
            d3.select('#scree-plot').html('');
            
            // Create SVG
            const svg = d3.select('#scree-plot')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
                
            // X scale
            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(eigenvalues.map((_, i) => `PC ${i + 1}`))
                .padding(0.2);
                
            // Y scale for eigenvalues
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(eigenvalues)])
                .range([height, 0]);
                
            // Y scale for cumulative variance (percentage)
            const y2Scale = d3.scaleLinear()
                .domain([0, 1])
                .range([height, 0]);
                
            // Add X axis
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .selectAll('text')
                .attr('transform', 'translate(-10,0)rotate(-45)')
                .style('text-anchor', 'end');
                
            // Add Y axis for eigenvalues
            svg.append('g')
                .call(d3.axisLeft(yScale));
                
            // Add Y axis for cumulative variance
            svg.append('g')
                .attr('transform', `translate(${width},0)`)
                .call(d3.axisRight(y2Scale).tickFormat(d => `${(d * 100).toFixed(0)}%`));
                
            // Add bars for eigenvalues
            svg.selectAll('.bar')
                .data(eigenvalues)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', (_, i) => xScale(`PC ${i + 1}`))
                .attr('y', d => yScale(d))
                .attr('width', xScale.bandwidth())
                .attr('height', d => height - yScale(d))
                .attr('fill', (_, i) => i === selectedDimension - 1 ? '#e74c3c' : '#3498db')
                .on('mouseover', function(event, d) {
                    tooltip.style('display', 'block')
                        .html(`<strong>PC ${eigenvalues.indexOf(d) + 1}</strong><br>Eigenvalue: ${d.toFixed(2)}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.style('display', 'none');
                })
                .on('click', function(event, d) {
                    // Update selected dimension
                    selectedDimension = eigenvalues.indexOf(d) + 1;
                    
                    // Update visualization
                    loadScreePlot();
                    loadBiplot();
                    loadScatterplotMatrix();
                });
                
            // Add line for cumulative variance
            const line = d3.line()
                .x((_, i) => xScale(`PC ${i + 1}`) + xScale.bandwidth() / 2)
                .y(d => y2Scale(d));
                
            svg.append('path')
                .datum(cumulativeVariance)
                .attr('fill', 'none')
                .attr('stroke', '#e74c3c')
                .attr('stroke-width', 2)
                .attr('d', line);
                
            // Add points for cumulative variance
            svg.selectAll('.dot')
                .data(cumulativeVariance)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', (_, i) => xScale(`PC ${i + 1}`) + xScale.bandwidth() / 2)
                .attr('cy', d => y2Scale(d))
                .attr('r', 4)
                .attr('fill', '#e74c3c');
                
            // Add labels
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + margin.bottom - 10)
                .attr('text-anchor', 'middle')
                .text('Principal Components');
                
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -margin.left + 15)
                .attr('text-anchor', 'middle')
                .text('Eigenvalue');
                
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', width + 35)
                .attr('text-anchor', 'middle')
                .text('Cumulative Variance');
                
            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -margin.top / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .text('PCA Scree Plot');
        })
        .catch(error => {
            console.error('Error loading scree plot:', error);
            d3.select('#scree-plot').html(`<div class="error-message">Error loading PCA data</div>`);
        });
}

// Global variables
// const API_BASE_URL = 'http://localhost:5001';
// let selectedBorough = 'all';
// let selectedConstructionType = 'all';
// let yearRange = [2000, 2025];
let brushedDimensions = {};

// Create tooltip
// const tooltip = d3.select('#tooltip');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Load the PCP visualization
    loadParallelCoordinates();
    
    // Add reset button event listener
    document.getElementById('reset-pcp').addEventListener('click', resetPCPBrushes);
});

// Function to load the Parallel Coordinates Plot
function loadParallelCoordinates() {
    fetch(`${API_BASE_URL}/full_pcp_data`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            // Set up dimensions
            const margin = {top: 50, right: 50, bottom: 50, left: 50};
            const width = 1200 - margin.left - margin.right; 
            const height = 500 - margin.top - margin.bottom;

            // const width = document.getElementById('pcp').clientWidth - margin.left - margin.right;
            // const height = document.getElementById('pcp').clientHeight - margin.top - margin.bottom;
            
            // Clear previous chart
            d3.select('#pcp').html('');
            
            // Create SVG
            const svg = d3.select('#pcp')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
            
            // Extract dimensions and values
            const dimensions = data.dimensions;
            const categoricalDims = data.categorical_dims;
            const numericalDims = data.numerical_dims;
            
            // Filter data based on current selections
            let filteredData = data.items;
            if (selectedBorough !== 'all') {
                filteredData = filteredData.filter(d => d.Borough === selectedBorough);
            }
            if (selectedConstructionType !== 'all') {
                filteredData = filteredData.filter(d => d['Construction Type'] === selectedConstructionType);
            }
            
            // Create scales for each dimension
            const y = {};
            const x = d3.scalePoint()
                .range([0, width])
                .domain(dimensions);
            
            // For each dimension, create a y scale
            dimensions.forEach(dimension => {
                if (categoricalDims.includes(dimension)) {
                    // Categorical scale
                    const values = Array.from(new Set(filteredData.map(d => d[dimension])))
                        .filter(d => d !== undefined && d !== null);
                    
                    y[dimension] = d3.scalePoint()
                        .domain(values)
                        .range([height, 0]);
                } else {
                    // Numerical scale
                    const values = filteredData.map(d => +d[dimension]).filter(d => !isNaN(d));
                    
                    y[dimension] = d3.scaleLinear()
                        .domain([d3.min(values), d3.max(values)])
                        .range([height, 0]);
                }
            });
            
            // Add cluster color scale
            const clusters = Array.from(new Set(filteredData.map(d => d.cluster)));
            const color = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(clusters);
            
            // Function to draw the lines
            function path(d) {
                return d3.line()(dimensions.map(dimension => {
                    return [x(dimension), y[dimension](d[dimension])];
                }));
            }
            
            // Add the lines
            const lines = svg.selectAll(".path-line")
                .data(filteredData)
                .enter()
                .append("path")
                .attr("class", "path-line")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", d => color(d.cluster))
                .style("opacity", 0.7)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .style("stroke-width", "3px")
                        .style("opacity", 1);
                    
                    // Show tooltip with data
                    let tooltipContent = `<strong>Cluster: ${d.cluster}</strong><br>`;
                    dimensions.forEach(dim => {
                        tooltipContent += `${dim}: ${d[dim]}<br>`;
                    });
                    
                    tooltip.style("display", "block")
                        .html(tooltipContent)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .style("stroke-width", "1.5px")
                        .style("opacity", 0.7);
                    
                    tooltip.style("display", "none");
                });
            
            // Add a group element for each dimension
            const axes = svg.selectAll(".dimension")
                .data(dimensions)
                .enter()
                .append("g")
                .attr("class", "dimension")
                .attr("transform", d => `translate(${x(d)})`);
            
            // Add axis title
            axes.append("text")
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .attr("fill", "#333")
                .text(d => d)
                .style("font-size", "12px");
            
            // Add axis
            axes.each(function(d) {
                d3.select(this).call(d3.axisLeft(y[d]));
            });
            
            // Add brushes
            axes.append("g")
                .attr("class", "brush")
                .each(function(d) {
                    d3.select(this).call(
                        d3.brushY()
                            .extent([[-10, 0], [10, height]])
                            .on("start", brushstart)
                            .on("brush", brushed)
                            .on("end", brushed)
                    );
                });
            
            // Functions for brushing
            function brushstart() {
                d3.event.sourceEvent.stopPropagation();
            }
            
            function brushed() {
                const actives = [];
                
                svg.selectAll(".brush")
                    .filter(function() {
                        return d3.brushSelection(this) !== null;
                    })
                    .each(function(d) {
                        actives.push({
                            dimension: d,
                            extent: d3.brushSelection(this)
                        });
                    });
                
                if (actives.length === 0) {
                    lines.style("display", null);
                } else {
                    lines.style("display", function(d) {
                        return actives.every(function(active) {
                            const dim = active.dimension;
                            const extent = active.extent;
                            const value = y[dim](d[dim]);
                            return extent[0] <= value && value <= extent[1];
                        }) ? null : "none";
                    });
                }
            }
            
            // Add legend
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 100}, 10)`);
            
            clusters.forEach((cluster, i) => {
                const legendRow = legend.append("g")
                    .attr("transform", `translate(0, ${i * 20})`);
                
                legendRow.append("rect")
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", color(cluster));
                
                legendRow.append("text")
                    .attr("x", 15)
                    .attr("y", 10)
                    .text(`Cluster ${cluster}`)
                    .style("font-size", "12px");
            });
        })
        .catch(error => {
            console.error('Error loading parallel coordinates:', error);
            d3.select('#pcp').html(`<div class="error-message">Error loading PCP data: ${error.message}</div>`);
        });
}

// Function to reset PCP brushes
function resetPCPBrushes() {
    d3.select('#pcp').selectAll('.brush').each(function() {
        d3.select(this).call(d3.brush().clear);
    });
    
    // Reset display of all lines
    d3.select('#pcp').selectAll('.path-line').style('display', null);
    
    // Clear brushed dimensions
    brushedDimensions = {};
}

// // Function to load geographic choropleth map visualization
// function loadGeoMap() {
//   // Fetch GeoJSON data for NYC boroughs
//   fetch('https://raw.githubusercontent.com/nycehs/NYC_geography/master/borough_boundaries.geojson')
//       .then(response => response.json())
//       .then(boroughBoundaries => {
//           // Fetch housing data from our backend
//           return fetch(`${API_BASE_URL}/geo_data`)
//               .then(response => response.json())
//               .then(housingData => {
//                   return { boroughBoundaries, housingData };
//               });
//       })
//       .then(({ boroughBoundaries, housingData }) => {
//           if (!Array.isArray(housingData)) throw new Error('Invalid housing data format');
          
//           // Filter data based on selected filters
//           if (selectedBorough !== 'all') {
//               housingData = housingData.filter(d => d.Borough === selectedBorough);
//           }
          
//           if (selectedConstructionType !== 'all') {
//               housingData = housingData.filter(d => d['Construction Type'] === selectedConstructionType);
//           }
          
//           // Clear previous map
//           const mapContainer = document.getElementById('geo-map');
//           mapContainer.innerHTML = '';
          
//           // Create map with Leaflet.js
//           const map = L.map(mapContainer).setView([40.7128, -74.0060], 10); // NYC coordinates
          
//           // Add tile layer (base map)
//           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//               attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           }).addTo(map);
          
//           // Aggregate housing data by borough
//           const boroughStats = {};
//           housingData.forEach(d => {
//               if (!boroughStats[d.Borough]) {
//                   boroughStats[d.Borough] = {
//                       totalUnits: 0,
//                       developments: 0,
//                       constructionTypes: new Set(),
//                       programGroups: new Set()
//                   };
//               }
              
//               boroughStats[d.Borough].totalUnits += parseInt(d['Total Units']) || 0;
//               boroughStats[d.Borough].developments += 1;
//               boroughStats[d.Borough].constructionTypes.add(d['Construction Type']);
//               boroughStats[d.Borough].programGroups.add(d['Program Group']);
//           });
          
//           // Process for display
//           Object.keys(boroughStats).forEach(borough => {
//               boroughStats[borough].constructionTypes = Array.from(boroughStats[borough].constructionTypes);
//               boroughStats[borough].programGroups = Array.from(boroughStats[borough].programGroups);
//           });
          
//           // Get color based on total units
//           function getColor(units) {
//               return units > 50000 ? '#08519c' :
//                      units > 25000 ? '#3182bd' :
//                      units > 10000 ? '#6baed6' :
//                      units > 5000  ? '#9ecae1' :
//                      units > 1000  ? '#c6dbef' :
//                                      '#eff3ff';
//           }
          
//           // Style function for GeoJSON
//           function style(feature) {
//               const borough = feature.properties.boro_name;
//               const stats = boroughStats[borough] || { totalUnits: 0 };
              
//               return {
//                   fillColor: getColor(stats.totalUnits),
//                   weight: 2,
//                   opacity: 1,
//                   color: 'white',
//                   dashArray: '3',
//                   fillOpacity: 0.7
//               };
//           }
          
//           // Add interaction
//           function highlightFeature(e) {
//               const layer = e.target;
              
//               layer.setStyle({
//                   weight: 5,
//                   color: '#666',
//                   dashArray: '',
//                   fillOpacity: 0.7
//               });
              
//               layer.bringToFront();
//               info.update(layer.feature.properties);
//           }
          
//           function resetHighlight(e) {
//               geojsonLayer.resetStyle(e.target);
//               info.update();
//           }
          
//           function zoomToFeature(e) {
//               map.fitBounds(e.target.getBounds());
              
//               // Update borough filter and reload visualizations
//               const borough = e.target.feature.properties.boro_name;
//               document.getElementById('borough-filter').value = borough;
//               updateFilters();
//           }
          
//           function onEachFeature(feature, layer) {
//               layer.on({
//                   mouseover: highlightFeature,
//                   mouseout: resetHighlight,
//                   click: zoomToFeature
//               });
//           }
          
//           // Add GeoJSON layer
//           const geojsonLayer = L.geoJson(boroughBoundaries, {
//               style: style,
//               onEachFeature: onEachFeature
//           }).addTo(map);
          
//           // Add info control
//           const info = L.control();
          
//           info.onAdd = function(map) {
//               this._div = L.DomUtil.create('div', 'info');
//               this.update();
//               return this._div;
//           };
          
//           info.update = function(props) {
//               const borough = props ? props.boro_name : null;
//               const stats = borough ? boroughStats[borough] : null;
              
//               this._div.innerHTML = '<h4>NYC Affordable Housing</h4>' + 
//                   (props ? 
//                       `<b>${borough}</b><br />
//                       Total Units: ${stats ? stats.totalUnits.toLocaleString() : 'No data'}<br />
//                       Developments: ${stats ? stats.developments : 'None'}<br />
//                       Construction Types: ${stats ? stats.constructionTypes.join(', ') : 'N/A'}<br />
//                       Program Groups: ${stats ? stats.programGroups.join(', ') : 'N/A'}`
//                       : 'Hover over a borough');
//           };
          
//           info.addTo(map);
          
//           // Add legend
//           const legend = L.control({position: 'bottomright'});
          
//           legend.onAdd = function(map) {
//               const div = L.DomUtil.create('div', 'legend');
//               const grades = [0, 1000, 5000, 10000, 25000, 50000];
//               const labels = [];
              
//               // Add title
//               div.innerHTML = '<h4>Total Housing Units</h4>';
              
//               // Loop through density intervals and generate labels
//               for (let i = 0; i < grades.length; i++) {
//                   div.innerHTML +=
//                       '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
//                       grades[i].toLocaleString() + (grades[i + 1] ? '&ndash;' + grades[i + 1].toLocaleString() + '<br>' : '+');
//               }
              
//               return div;
//           };
          
//           legend.addTo(map);
          
//           // Add individual housing development points
//           housingData.forEach(d => {
//               // Calculate radius based on unit count
//               const radius = Math.sqrt(d['Total Units']) * 0.5;
              
//               // Create circle marker
//               const circle = L.circleMarker([d.Latitude, d.Longitude], {
//                   radius: Math.min(Math.max(radius, 2), 10), // Min 2px, max 10px
//                   fillColor: '#e41a1c',
//                   color: '#fff',
//                   weight: 1,
//                   opacity: 0.8,
//                   fillOpacity: 0.6
//               }).addTo(map);
              
//               // Add popup with development details
//               circle.bindPopup(`
//                   <div class="popup-content">
//                       <h4>Housing Development</h4>
//                       <p><strong>Borough:</strong> ${d.Borough}</p>
//                       <p><strong>Total Units:</strong> ${d['Total Units']}</p>
//                       <p><strong>Construction Type:</strong> ${d['Construction Type']}</p>
//                       <p><strong>Program Group:</strong> ${d['Program Group']}</p>
//                   </div>
//               `);
//           });
          
//           // Add CSS for the legend and info box
//           const style = document.createElement('style');
//           style.textContent = `
//               .info {
//                   padding: 6px 8px;
//                   font: 14px/16px Arial, Helvetica, sans-serif;
//                   background: white;
//                   background: rgba(255, 255, 255, 0.8);
//                   box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
//                   border-radius: 5px;
//               }
//               .info h4 {
//                   margin: 0 0 5px;
//                   color: #777;
//               }
//               .legend {
//                   line-height: 18px;
//                   color: #555;
//                   background: white;
//                   background: rgba(255, 255, 255, 0.8);
//                   padding: 10px;
//                   border-radius: 5px;
//               }
//               .legend i {
//                   width: 18px;
//                   height: 18px;
//                   float: left;
//                   margin-right: 8px;
//                   opacity: 0.7;
//               }
//               .legend h4 {
//                   margin: 0 0 5px;
//                   color: #777;
//               }
//               .popup-content {
//                   font-family: Arial, sans-serif;
//                   max-width: 250px;
//               }
//               .popup-content h4 {
//                   margin: 0 0 5px;
//                   color: #333;
//               }
//               .popup-content p {
//                   margin: 3px 0;
//               }
//           `;
//           document.head.appendChild(style);
          
//           // Fit map to borough boundaries
//           map.fitBounds(geojsonLayer.getBounds());
//       })
//       .catch(error => {
//           console.error('Error loading geo map:', error);
//           document.getElementById('geo-map').innerHTML = `<div class="error-message">Error loading map data: ${error.message}</div>`;
//       });
// }


// Function to load geographic choropleth map visualization
function loadGeoMap() {
  // Fetch GeoJSON data for NYC boroughs
  fetch('https://raw.githubusercontent.com/nycehs/NYC_geography/master/borough_boundaries.geojson')
      .then(response => response.json())
      .then(boroughBoundaries => {
          // Fetch housing data from our backend
          return fetch(`${API_BASE_URL}/geo_data`)
              .then(response => response.json())
              .then(housingData => {
                  return { boroughBoundaries, housingData };
              });
      })
      .then(({ boroughBoundaries, housingData }) => {
          if (!Array.isArray(housingData)) throw new Error('Invalid housing data format');
          
          // Filter data based on selected filters
          if (selectedBorough !== 'all') {
              housingData = housingData.filter(d => d.Borough === selectedBorough);
          }
          
          if (selectedConstructionType !== 'all') {
              housingData = housingData.filter(d => d['Construction Type'] === selectedConstructionType);
          }
          
          // Clear previous map
          const mapContainer = document.getElementById('geo-map');
          mapContainer.innerHTML = '';
          
          // Create map with Leaflet.js
          const map = L.map(mapContainer).setView([40.7128, -74.0060], 10); // NYC coordinates
          
          // Add tile layer (base map)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Get color-by and size-by selections
          const colorBy = document.getElementById('map-color-by').value;
          const sizeBy = document.getElementById('map-size-by').value;
          
          // Aggregate housing data by borough
          const boroughStats = {};
          housingData.forEach(d => {
              if (!boroughStats[d.Borough]) {
                  boroughStats[d.Borough] = {
                      totalUnits: 0,
                      developments: 0,
                      constructionTypes: new Set(),
                      programGroups: new Set()
                  };
              }
              
              boroughStats[d.Borough].totalUnits += parseInt(d['Total Units']) || 0;
              boroughStats[d.Borough].developments += 1;
              boroughStats[d.Borough].constructionTypes.add(d['Construction Type']);
              boroughStats[d.Borough].programGroups.add(d['Program Group']);
          });
          
          // Process for display
          Object.keys(boroughStats).forEach(borough => {
              boroughStats[borough].constructionTypes = Array.from(boroughStats[borough].constructionTypes);
              boroughStats[borough].programGroups = Array.from(boroughStats[borough].programGroups);
          });
          
          // Get color based on total units
          function getColor(units) {
              return units > 50000 ? '#08519c' :
                     units > 25000 ? '#3182bd' :
                     units > 10000 ? '#6baed6' :
                     units > 5000  ? '#9ecae1' :
                     units > 1000  ? '#c6dbef' :
                                     '#eff3ff';
          }
          
          // Style function for GeoJSON
          function style(feature) {
              const borough = feature.properties.boro_name;
              const stats = boroughStats[borough] || { totalUnits: 0 };
              
              return {
                  fillColor: getColor(stats.totalUnits),
                  weight: 2,
                  opacity: 1,
                  color: 'white',
                  dashArray: '3',
                  fillOpacity: 0.7
              };
          }
          
          // Add interaction
          function highlightFeature(e) {
              const layer = e.target;
              
              layer.setStyle({
                  weight: 5,
                  color: '#666',
                  dashArray: '',
                  fillOpacity: 0.7
              });
              
              layer.bringToFront();
              info.update(layer.feature.properties);
          }
          
          function resetHighlight(e) {
              geojsonLayer.resetStyle(e.target);
              info.update();
          }
          
          function zoomToFeature(e) {
              map.fitBounds(e.target.getBounds());
              
              // Update borough filter and reload visualizations
              const borough = e.target.feature.properties.boro_name;
              document.getElementById('borough-filter').value = borough;
              updateFilters();
          }
          
          function onEachFeature(feature, layer) {
              layer.on({
                  mouseover: highlightFeature,
                  mouseout: resetHighlight,
                  click: zoomToFeature
              });
          }
          
          // Add GeoJSON layer
          const geojsonLayer = L.geoJson(boroughBoundaries, {
              style: style,
              onEachFeature: onEachFeature
          }).addTo(map);
          
          // Add info control
          const info = L.control();
          
          info.onAdd = function(map) {
              this._div = L.DomUtil.create('div', 'info');
              this.update();
              return this._div;
          };
          
          info.update = function(props) {
              const borough = props ? props.boro_name : null;
              const stats = borough ? boroughStats[borough] : null;
              
              this._div.innerHTML = '<h4>NYC Affordable Housing</h4>' + 
                  (props ? 
                      `<b>${borough}</b><br />
                      Total Units: ${stats ? stats.totalUnits.toLocaleString() : 'No data'}<br />
                      Developments: ${stats ? stats.developments : 'None'}<br />
                      Construction Types: ${stats && stats.constructionTypes.length > 0 ? stats.constructionTypes.join(', ') : 'N/A'}<br />
                      Program Groups: ${stats && stats.programGroups.length > 0 ? stats.programGroups.join(', ') : 'N/A'}`
                      : 'Hover over a borough');
          };
          
          info.addTo(map);
          
          // Add legend
          const legend = L.control({position: 'bottomright'});
          
          legend.onAdd = function(map) {
              const div = L.DomUtil.create('div', 'legend');
              const grades = [0, 1000, 5000, 10000, 25000, 50000];
              
              // Add title
              div.innerHTML = '<h4>Total Housing Units</h4>';
              
              // Loop through density intervals and generate labels
              for (let i = 0; i < grades.length; i++) {
                  div.innerHTML +=
                      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                      grades[i].toLocaleString() + (grades[i + 1] ? '&ndash;' + grades[i + 1].toLocaleString() + '<br>' : '+');
              }
              
              return div;
          };
          
          legend.addTo(map);
          
          // Define color scales based on selected property for individual points
          let pointColorScale;
          
          if (colorBy === 'borough') {
              // Borough-specific colors
              pointColorScale = d => {
                  const boroughColors = {
                      'Bronx': '#ff7f0e',
                      'Brooklyn': '#1f77b4',
                      'Manhattan': '#2ca02c',
                      'Queens': '#d62728',
                      'Staten Island': '#9467bd'
                  };
                  return boroughColors[d.Borough] || '#888888';
              };
          } else if (colorBy === 'program') {
              // Program type colors
              const programs = [...new Set(housingData.map(d => d['Program Group']))];
              const programColorScale = d3.scaleOrdinal(d3.schemeCategory10)
                  .domain(programs);
              pointColorScale = d => programColorScale(d['Program Group']);
          } else if (colorBy === 'construction') {
              // Construction type colors
              const constructionTypes = [...new Set(housingData.map(d => d['Construction Type']))];
              const constructionColorScale = d3.scaleOrdinal(d3.schemeCategory10)
                  .domain(constructionTypes);
              pointColorScale = d => constructionColorScale(d['Construction Type']);
          } else {
              // Default color
              pointColorScale = d => '#e41a1c';
          }
          
          // Define size scale based on selected property
          let sizeScale;
          
          if (sizeBy === 'units') {
              sizeScale = d => Math.sqrt(d['Total Units'] || 0) * 0.5;
          } else if (sizeBy === 'low-income') {
              sizeScale = d => Math.sqrt(d['Low Income Units'] || 0) * 0.5;
          } else if (sizeBy === 'very-low-income') {
              sizeScale = d => Math.sqrt(d['Very Low Income Units'] || 0) * 0.5;
          } else if (sizeBy === 'extremely-low-income') {
              sizeScale = d => Math.sqrt(d['Extremely Low Income Units'] || 0) * 0.5;
          } else {
              sizeScale = d => Math.sqrt(d['Total Units'] || 0) * 0.5;
          }
          
          // Add individual housing development points
          housingData.forEach(d => {
              // Calculate radius based on selected size property
              const radius = Math.min(Math.max(sizeScale(d), 2), 10); // Min 2px, max 10px
              const color = pointColorScale(d);
              
              // Create circle marker
              const circle = L.circleMarker([d.Latitude, d.Longitude], {
                  radius: radius,
                  fillColor: color,
                  color: '#fff',
                  weight: 1,
                  opacity: 0.8,
                  fillOpacity: 0.6
              }).addTo(map);
              
              // Add popup with development details
              circle.bindPopup(`
                  <div class="popup-content">
                      <h4>Housing Development</h4>
                      <p><strong>Borough:</strong> ${d.Borough}</p>
                      <p><strong>Total Units:</strong> ${d['Total Units']}</p>
                      <p><strong>Construction Type:</strong> ${d['Construction Type']}</p>
                      <p><strong>Program Group:</strong> ${d['Program Group']}</p>
                  </div>
              `);
          });
          
          // Add event listeners for control changes
          document.getElementById('map-color-by').addEventListener('change', loadGeoMap);
          document.getElementById('map-size-by').addEventListener('change', loadGeoMap);
          
          // Fit map to borough boundaries
          map.fitBounds(geojsonLayer.getBounds());
      })
      .catch(error => {
          console.error('Error loading geo map:', error);
          document.getElementById('geo-map').innerHTML = `<div class="error-message">Error loading map data: ${error.message}</div>`;
      });
}

// Make sure to include this function in your loadAllVisualizations() function
// function loadAllVisualizations() {
//     loadBarChartByBorough();
//     loadPieCharts();
//     loadGeoMap();  // <-- Add this line
//     loadSankeyDiagram();
//     // ... other visualizations
// }
