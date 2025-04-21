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
    loadTreemap();
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



function loadSankeyPlot() {
  fetch('http://localhost:5001/sankey_data')
    .then(response => response.json())
    .then(data => {
      if (!data.nodes || !data.links) throw new Error('Invalid Sankey data format');
      
      // Set up dimensions
      const margin = {top: 30, right: 150, bottom: 20, left: 150};
      const width = document.getElementById('sankey-diagram').clientWidth - margin.left - margin.right;
      const height = document.getElementById('sankey-diagram').clientHeight - margin.top - margin.bottom;
      
      // Clear previous chart
      d3.select('#sankey-diagram').html('');
      
      // Create SVG with a light background
      const svg = d3.select('#sankey-diagram')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Create Sankey generator
      const sankey = d3.sankey()
        .nodeWidth(25)
        .nodePadding(15)
        .extent([[1, 1], [width - 1, height - 5]]);
      
      // Format the data for the Sankey layout
      const graph = sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links.map(d => Object.assign({}, d))
      });
      
      // Create vibrant color scales for nodes
      const boroughColors = {
        'Bronx': '#FF6B6B',
        'Brooklyn': '#4ECDC4',
        'Manhattan': '#45B7D1',
        'Queens': '#FFA62B',
        'Staten Island': '#845EC2'
      };
      
      const incomeColors = {
        'Extremely Low Income Units': '#1E3A8A',
        'Very Low Income Units': '#1E40AF',
        'Low Income Units': '#2563EB',
        'Moderate Income Units': '#3B82F6',
        'Middle Income Units': '#60A5FA',
        'Other Income Units': '#93C5FD'
      };
      
      // Function to get node color
      function getNodeColor(node) {
        if (boroughColors[node.name]) {
          return boroughColors[node.name];
        } else if (incomeColors[node.name]) {
          return incomeColors[node.name];
        }
        return '#888888'; // Default color
      }
      
      // Create gradient definitions for links
      const defs = svg.append('defs');
      
      // Create gradients for each link
      graph.links.forEach((link, i) => {
        const gradientId = `link-gradient-${i}`;
        const gradient = defs.append('linearGradient')
          .attr('id', gradientId)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', link.source.x1)
          .attr('x2', link.target.x0);
        
        // Start color (source node color)
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', getNodeColor(link.source))
          .attr('stop-opacity', 0.8);
        
        // End color (target node color)
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', getNodeColor(link.target))
          .attr('stop-opacity', 0.8);
      });
      
      // Add links with gradients and improved styling
      const link = svg.append('g')
        .selectAll('.link')
        .data(graph.links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('stroke-width', d => Math.max(1, d.width))
        .attr('stroke', (d, i) => `url(#link-gradient-${i})`)
        .style('fill', 'none')
        .style('stroke-opacity', 0.7)
        .on('mouseover', function(event, d) {
          // Highlight this link
          d3.select(this)
            .style('stroke-opacity', 1)
            .attr('stroke-width', d => Math.max(1, d.width + 2));
          
          // Highlight connected nodes
          node.filter(n => n === d.source || n === d.target)
            .style('stroke', '#000')
            .style('stroke-width', 2);
          
          // Show tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("display", "block")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", 1000)
            .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)");
          
          tooltip.html(`
            <strong>${d.source.name} → ${d.target.name}</strong><br>
            ${d.value.toLocaleString()} units (${(d.value / d.source.value * 100).toFixed(1)}%)
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 20) + 'px');
        })
        .on('mouseout', function() {
          // Reset styles
          d3.select(this)
            .style('stroke-opacity', 0.7)
            .attr('stroke-width', d => Math.max(1, d.width));
          
          // Reset node highlighting
          node.style('stroke', '#fff')
            .style('stroke-width', 1);
          
          // Remove tooltip
          d3.select("body").selectAll(".tooltip").remove();
        });
      
      // Add nodes with enhanced styling
      const node = svg.append('g')
        .selectAll('.node')
        .data(graph.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);
      
      // Add rectangles for nodes with improved styling
      node.append('rect')
        .attr('height', d => Math.max(d.y1 - d.y0, 10))
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', d => getNodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('rx', 4) // Rounded corners
        .attr('ry', 4)
        .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.2))')
        .on('mouseover', function(event, d) {
          // Highlight connected links
          link.style('stroke-opacity', l => 
            l.source === d || l.target === d ? 1 : 0.1
          );
          
          // Increase stroke width for connected links
          link.style('stroke-width', l => 
            l.source === d || l.target === d ? 
            Math.max(1, l.width + 2) : Math.max(1, l.width)
          );
          
          // Highlight this node
          d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', 2);
          
          // Show tooltip with node details
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("display", "block")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", 1000)
            .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)");
          
          let tooltipContent = `<strong>${d.name}</strong><br>Total: ${d.value.toLocaleString()} units`;
          
          // If it's a borough, show outgoing flows
          if (boroughColors[d.name]) {
            tooltipContent += '<br><br>Distribution:';
            d.sourceLinks.forEach(link => {
              tooltipContent += `<br>${link.target.name}: ${link.value.toLocaleString()} (${(link.value / d.value * 100).toFixed(1)}%)`;
            });
          } 
          // If it's an income category, show incoming flows
          else if (incomeColors[d.name]) {
            tooltipContent += '<br><br>Sources:';
            d.targetLinks.forEach(link => {
              tooltipContent += `<br>${link.source.name}: ${link.value.toLocaleString()} (${(link.value / d.value * 100).toFixed(1)}%)`;
            });
          }
          
          tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 20) + 'px');
        })
        .on('mouseout', function() {
          // Reset link opacity
          link.style('stroke-opacity', 0.7)
            .style('stroke-width', d => Math.max(1, d.width));
          
          // Reset node stroke
          d3.select(this)
            .style('stroke', '#fff')
            .style('stroke-width', 1);
          
          // Remove tooltip
          d3.select("body").selectAll(".tooltip").remove();
        });
      
      // Add labels with improved styling
      node.append('text')
        .attr('x', d => d.x0 < width / 2 ? -8 : d.x1 - d.x0 + 8)
        .attr('y', d => (d.y1 - d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
        .text(d => d.name)
        .style('font-size', '12px')
        .style('font-family', "'Poppins', sans-serif")
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('fill', d => {
          // Use white text for dark backgrounds, black for light
          const color = d3.color(getNodeColor(d));
          return color.l < 0.5 ? '#fff' : '#000';
        });
      
      // Add value labels with improved styling
      node.append('text')
        .attr('x', d => d.x0 < width / 2 ? -8 : d.x1 - d.x0 + 8)
        .attr('y', d => (d.y1 - d.y0) / 2 + 14)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
        .text(d => `${d.value.toLocaleString()} units`)
        .style('font-size', '10px')
        .style('font-family', "'Poppins', sans-serif")
        .style('pointer-events', 'none')
        .style('fill', d => {
          const color = d3.color(getNodeColor(d));
          return color.l < 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
        });
      
     
    })
    .catch(error => {
      console.error('Error loading Sankey diagram:', error);
      d3.select('#sankey-diagram').html(`
        <div style="text-align: center; padding: 20px; color: #d63031; background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3>Error Loading Diagram</h3>
          <p>${error.message}</p>
          <button onclick="loadSankeyPlot()" style="background: #0984e3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
            Retry
          </button>
        </div>
      `);
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadSankeyPlot();
});



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

function plotRadar() {
  // We'll use the full PCP data to compute average values for numeric dimensions.
  fetch(`http://localhost:5001/full_pcp_data?k=${currentK}`)
    .then(response => response.json())
    .then(data => {
      const numericalDims = data.numerical_dims;
      const items = data.items;
      
      // Use the filtered set if any selections exist
      const filtered = items.filter((d, i) => {
        return selectedDataIndices.size === 0 ? true : selectedDataIndices.has(i);
      });
      
      // Compute average for each numerical dimension
      const avgData = numericalDims.map(dim => {
        const vals = filtered.map(d => +d[dim]);
        return { dimension: dim, average: d3.mean(vals) };
      });
      
      // Also compute global min and max (for normalization)
      const globalAverages = numericalDims.map(dim => {
        const vals = items.map(d => +d[dim]);
        return { dimension: dim, min: d3.min(vals), max: d3.max(vals) };
      });
      
      // Build a dictionary for min-max lookup by dimension
      const minMax = {};
      globalAverages.forEach(d => {
        minMax[d.dimension] = { min: d.min, max: d.max };
      });
      
      // Set up radar plot dimensions
      const margin = {top: 50, right: 50, bottom: 50, left: 50};
      const container = d3.select("#radar-plot");
      container.html("");
      const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
      const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
      const radius = Math.min(width, height) / 2;
      
      const svg = container.append("svg")
          .attr("width", width+margin.left+margin.right)
          .attr("height", height+margin.top+margin.bottom)
          .append("g")
          .attr("transform", `translate(${(width+margin.left+margin.right)/2},${(height+margin.top+margin.bottom)/2})`);
      
      // Number of axes equals the number of dimensions
      const total = numericalDims.length;
      const angleSlice = (Math.PI * 2) / total;
      
      // Scale for radius (for each axis, normalize average value between 0 and radius)
      const rScale = {};
      numericalDims.forEach(dim => {
        rScale[dim] = d3.scaleLinear()
                        .domain([minMax[dim].min, minMax[dim].max])
                        .range([0, radius]);
      });
      
      // Draw grid circles and axis lines
      const levels = 5;
      for (let level = 1; level <= levels; level++) {
        const rLevel = radius * level / levels;
        svg.append("circle")
           .attr("r", rLevel)
           .attr("fill", "none")
           .attr("stroke", "#ccc")
           .attr("stroke-opacity", 0.5);
      }
      
      numericalDims.forEach((dim, i) => {
        const angle = i * angleSlice - Math.PI/2;
        const lineCoord = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
        svg.append("line")
           .attr("x1", 0)
           .attr("y1", 0)
           .attr("x2", lineCoord.x)
           .attr("y2", lineCoord.y)
           .attr("stroke", "#ccc")
           .attr("stroke-width", 1);
           
        // Axis label
        const labelOffset = 10;
        svg.append("text")
           .attr("x", Math.cos(angle) * (radius + labelOffset))
           .attr("y", Math.sin(angle) * (radius + labelOffset))
           .attr("text-anchor", "middle")
           .attr("font-size", "10px")
           .text(dim);
      });
      
      // Build radar line path using the average data
      const radarLine = d3.lineRadial()
                          .radius(d => rScale[d.dimension](d.average))
                          .angle((d, i) => i * angleSlice)
                          .curve(d3.curveLinearClosed);
      
      // Draw the radar area (polygon)
      svg.append("path")
         .datum(avgData)
         .attr("d", radarLine)
         .attr("fill", "#3498db")
         .attr("fill-opacity", 0.5)
         .attr("stroke", "#2980b9")
         .attr("stroke-width", 2);
      
      // Optionally, draw circles at the vertices
      svg.selectAll(".radarCircle")
         .data(avgData)
         .enter().append("circle")
         .attr("class", "radarCircle")
         .attr("r", 3)
         .attr("cx", (d, i) => Math.cos(i * angleSlice - Math.PI/2) * rScale[d.dimension](d.average))
         .attr("cy", (d, i) => Math.sin(i * angleSlice - Math.PI/2) * rScale[d.dimension](d.average))
         .attr("fill", "#fff")
         .attr("stroke", "#2980b9")
         .attr("stroke-width", 2)
         .on("mouseover", function(event,d) {
           tooltip.style("display", "block")
                  .html(`${d.dimension}<br>Average: ${d.average.toFixed(2)}`)
                  .style("left", (event.pageX + 10)+"px")
                  .style("top", (event.pageY -20)+"px");
         })
         .on("mouseout", function() {
           tooltip.style("display", "none");
         });
    })
    .catch(error => console.error("Error in Radar Plot:", error));
}

// Add this to script.js

// Load treemap visualization
// function loadTreemap() {
//   fetch(`${API_BASE_URL}/treemap_data`)
//       .then(response => response.json())
//       .then(data => {
//           if (!Array.isArray(data)) throw new Error('Invalid data format');
          
//           // Clear previous treemap
//           d3.select('#treemap').html('');
          
//           // Set up dimensions
//           const width = document.getElementById('treemap-container').clientWidth;
//           const height = document.getElementById('treemap-container').clientHeight - 20;
          
//           // Create SVG
//           const svg = d3.select('#treemap')
//               .append('svg')
//               .attr('width', width)
//               .attr('height', height);
          
//           // Create tooltip
//           const tooltip = d3.select('#treemap-tooltip');
          
//           // Create hierarchical data structure
//           const root = d3.hierarchy({ children: data })
//               .sum(d => d.value)
//               .sort((a, b) => b.value - a.value);
          
//           // Create treemap layout
//           const treemapLayout = d3.treemap()
//               .size([width, height])
//               .paddingOuter(3)
//               .paddingTop(20)
//               .paddingInner(1)
//               .round(true);
          
//           // Apply layout
//           treemapLayout(root);
          
//           // Color scale for boroughs
//           const boroughColorScale = d3.scaleOrdinal()
//               .domain(['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'])
//               .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);
          
//           // Color scale for construction types
//           const constructionColorScale = d3.scaleOrdinal()
//               .domain(['New Construction', 'Preservation'])
//               .range(['#8c564b', '#e377c2']);
          
//           // Get current color scheme
//           const colorBy = document.getElementById('treemap-color').value;
          
//           // Create cells for boroughs
//           const boroughCells = svg.selectAll('g.borough')
//               .data(root.children)
//               .enter()
//               .append('g')
//               .attr('class', 'borough')
//               .attr('transform', d => `translate(${d.x0},${d.y0})`);
          
//           // Add borough rectangles
//           boroughCells.append('rect')
//               .attr('width', d => d.x1 - d.x0)
//               .attr('height', d => d.y1 - d.y0)
//               .attr('fill', 'none')
//               .attr('stroke', '#000')
//               .attr('stroke-width', 2);
          
//           // Add borough labels
//           boroughCells.append('text')
//               .attr('x', 5)
//               .attr('y', 15)
//               .attr('font-weight', 'bold')
//               .text(d => `${d.data.name} (${d.data.percentage}%)`);
          
//           // Create cells for construction types
//           const constructionCells = svg.selectAll('g.construction')
//               .data(root.leaves())
//               .enter()
//               .append('g')
//               .attr('class', 'construction')
//               .attr('transform', d => `translate(${d.x0},${d.y0})`);
          
//           // Add construction type rectangles
//           constructionCells.append('rect')
//               .attr('width', d => Math.max(0, d.x1 - d.x0))
//               .attr('height', d => Math.max(0, d.y1 - d.y0))
//               .attr('fill', d => {
//                   if (colorBy === 'borough') {
//                       return boroughColorScale(d.parent.data.name);
//                   } else {
//                       return constructionColorScale(d.data.name);
//                   }
//               })
//               .attr('opacity', 0.8)
//               .attr('stroke', '#fff')
//               .attr('class', d => {
//                   const boroughClass = `borough-${d.parent.data.name.replace(/\s+/g, '.')}`;
//                   const constructionClass = `construction-${d.data.name.replace(/\s+/g, '.')}`;
//                   return `${boroughClass} ${constructionClass}`;
//               })
//               .on('mouseover', function(event, d) {
//                   // Calculate total income units
//                   const incomeData = d.data.incomeBreakdown;
//                   const totalIncomeUnits = Object.values(incomeData).reduce((a, b) => a + b, 0);
                  
//                   // Create income breakdown HTML
//                   let incomeBreakdownHTML = '';
//                   if (totalIncomeUnits > 0) {
//                       incomeBreakdownHTML = `
//                           <div class="income-breakdown">
//                               <h5>Income Level Distribution:</h5>
//                               <div class="income-bar">
//                                   ${Object.entries(incomeData).map(([level, units]) => {
//                                       const percentage = totalIncomeUnits > 0 ? (units / totalIncomeUnits) * 100 : 0;
//                                       const color = {
//                                           'Extremely Low': '#1f77b4',
//                                           'Very Low': '#ff7f0e',
//                                           'Low': '#2ca02c',
//                                           'Moderate': '#d62728',
//                                           'Middle': '#9467bd',
//                                           'Other': '#8c564b'
//                                       }[level];
//                                       return `<div style="width: ${percentage}%; background-color: ${color};" title="${level}: ${units} units (${percentage.toFixed(1)}%)"></div>`;
//                                   }).join('')}
//                               </div>
//                               <div class="income-bar-label">
//                                   <span>Extremely Low</span>
//                                   <span>Middle</span>
//                               </div>
//                           </div>
//                       `;
//                   }
                  
//                   // Show tooltip
//                   tooltip.style('display', 'block')
//                       .html(`
//                           <h4>${d.parent.data.name} - ${d.data.name}</h4>
//                           <p><strong>Total Units:</strong> ${d.data.value.toLocaleString()}</p>
//                           <p><strong>Percentage of ${d.parent.data.name}:</strong> ${d.data.percentage}%</p>
//                           <p><strong>Percentage of All Housing:</strong> ${((d.data.value / root.value) * 100).toFixed(2)}%</p>
//                           ${incomeBreakdownHTML}
//                       `)
//                       .style('left', (event.pageX + 10) + 'px')
//                       .style('top', (event.pageY - 28) + 'px');
                  
//                   // Highlight current cell
//                   d3.select(this)
//                       .attr('stroke', '#000')
//                       .attr('stroke-width', 2)
//                       .attr('opacity', 1);
//               })
//               .on('mouseout', function() {
//                   // Hide tooltip
//                   tooltip.style('display', 'none');
                  
//                   // Remove highlight
//                   d3.select(this)
//                       .attr('stroke', '#fff')
//                       .attr('stroke-width', 1)
//                       .attr('opacity', 0.8);
//               });
          
//           // Add construction type labels (only for cells big enough)
//           constructionCells.append('text')
//               .attr('x', 3)
//               .attr('y', 13)
//               .attr('font-size', '10px')
//               .text(d => {
//                   const width = d.x1 - d.x0;
//                   const height = d.y1 - d.y0;
//                   // Only show text if the cell is big enough
//                   if (width > 50 && height > 20) {
//                       return d.data.name;
//                   }
//                   return '';
//               });
          
//           // Add event listener for color scheme change
//           document.getElementById('treemap-color').addEventListener('change', function() {
//               const newColorBy = this.value;
              
//               // Update rectangle colors
//               svg.selectAll('rect')
//                   .transition()
//                   .duration(500)
//                   .attr('fill', function(d) {
//                       if (!d.parent) return 'none'; // Skip the root node
                      
//                       if (newColorBy === 'borough') {
//                           return boroughColorScale(d.parent.data.name);
//                       } else {
//                           return constructionColorScale(d.data.name);
//                       }
//                   });
//           });
//       })
//       .catch(error => {
//           console.error('Error loading treemap:', error);
//           d3.select('#treemap').html(`<div class="error-message">Error loading treemap: ${error.message}</div>`);
//       });
// }

// Add treemap to loadAllVisualizations function

// Add this to script.js

// // Load treemap visualization
// function loadTreemap() {
//   // Clear previous treemap
//   d3.select('#treemap').html('');
  
//   fetch(`${API_BASE_URL}/treemap_data`)
//       .then(response => response.json())
//       .then(data => {
//           if (!Array.isArray(data)) {
//               throw new Error('Invalid data format');
//           }
          
//           console.log("Treemap data:", data); // Debug: Check data structure
          
//           // Set up dimensions
//           const container = document.getElementById('treemap-container');
//           const width = container.clientWidth;
//           const height = container.clientHeight - 20;
          
//           console.log("Container dimensions:", width, height); // Debug: Check dimensions
          
//           // Create SVG
//           const svg = d3.select('#treemap')
//               .append('svg')
//               .attr('width', width)
//               .attr('height', height)
//               .attr('viewBox', `0 0 ${width} ${height}`)
//               .style('font', '10px sans-serif');
          
//           // Create tooltip
//           const tooltip = d3.select('#treemap-tooltip');
          
//           // Create hierarchical data structure
//           const hierarchy = {
//               name: "All Boroughs",
//               children: data
//           };
          
//           const root = d3.hierarchy(hierarchy)
//               .sum(d => d.value)
//               .sort((a, b) => b.value - a.value);
          
//           console.log("Hierarchy root:", root); // Debug: Check hierarchy
          
//           // Create treemap layout
//           const treemap = d3.treemap()
//               .size([width, height])
//               .paddingOuter(3)
//               .paddingTop(20)
//               .paddingInner(2)
//               .round(true);
          
//           // Apply layout
//           treemap(root);
          
//           console.log("Treemap layout applied:", root); // Debug: Check layout
          
//           // Color scales
//           const boroughColorScale = d3.scaleOrdinal()
//               .domain(['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'])
//               .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);
          
//           const constructionColorScale = d3.scaleOrdinal()
//               .domain(['New Construction', 'Preservation'])
//               .range(['#8c564b', '#e377c2']);
          
//           // Get current color scheme
//           const colorBy = document.getElementById('treemap-color').value;
          
//           // Create cell groups
//           const node = svg.selectAll("g")
//               .data(root.descendants().filter(d => d.depth > 0)) // Skip root node
//               .join("g")
//               .attr("transform", d => `translate(${d.x0},${d.y0})`);
          
//           // Add rectangles
//           node.append("rect")
//               .attr("width", d => Math.max(0, d.x1 - d.x0))
//               .attr("height", d => Math.max(0, d.y1 - d.y0))
//               .attr("fill", d => {
//                   if (d.depth === 1) {
//                       return boroughColorScale(d.data.name);
//                   } else if (colorBy === 'borough') {
//                       return boroughColorScale(d.parent.data.name);
//                   } else {
//                       return constructionColorScale(d.data.name);
//                   }
//               })
//               .attr("opacity", d => d.depth === 1 ? 0.7 : 0.9)
//               .attr("stroke", "#fff")
//               .attr("stroke-width", 1)
//               .attr("class", d => {
//                   if (d.depth === 1) {
//                       return `borough-${d.data.name.replace(/\s+/g, '.')}`;
//                   } else {
//                       const boroughClass = `borough-${d.parent.data.name.replace(/\s+/g, '.')}`;
//                       const constructionClass = `construction-${d.data.name.replace(/\s+/g, '.')}`;
//                       return `${boroughClass} ${constructionClass}`;
//                   }
//               })
//               .on("mouseover", function(event, d) {
//                   d3.select(this)
//                       .attr("stroke", "#000")
//                       .attr("stroke-width", 2)
//                       .attr("opacity", 1);
                  
//                   let tooltipContent = '';
                  
//                   if (d.depth === 1) {
//                       // Borough level
//                       tooltipContent = `
//                           <h4>${d.data.name}</h4>
//                           <p><strong>Total Units:</strong> ${d.value.toLocaleString()}</p>
//                           <p><strong>Percentage of All Housing:</strong> ${d.data.percentage}%</p>
//                       `;
//                   } else {
//                       // Construction type level
//                       const incomeData = d.data.incomeBreakdown;
//                       const totalIncomeUnits = Object.values(incomeData).reduce((a, b) => a + b, 0);
                      
//                       // Create income breakdown HTML
//                       let incomeBreakdownHTML = '';
//                       if (totalIncomeUnits > 0) {
//                           incomeBreakdownHTML = `
//                               <div class="income-breakdown">
//                                   <h5>Income Level Distribution:</h5>
//                                   <div class="income-bar">
//                                       ${Object.entries(incomeData).map(([level, units]) => {
//                                           const percentage = totalIncomeUnits > 0 ? (units / totalIncomeUnits) * 100 : 0;
//                                           const color = {
//                                               'Extremely Low': '#1f77b4',
//                                               'Very Low': '#ff7f0e',
//                                               'Low': '#2ca02c',
//                                               'Moderate': '#d62728',
//                                               'Middle': '#9467bd',
//                                               'Other': '#8c564b'
//                                           }[level];
//                                           return `<div style="width: ${percentage}%; background-color: ${color};" title="${level}: ${units} units (${percentage.toFixed(1)}%)"></div>`;
//                                       }).join('')}
//                                   </div>
//                                   <div class="income-bar-label">
//                                       <span>Extremely Low</span>
//                                       <span>Middle</span>
//                                   </div>
//                               </div>
//                           `;
//                       }
                      
//                       tooltipContent = `
//                           <h4>${d.parent.data.name} - ${d.data.name}</h4>
//                           <p><strong>Total Units:</strong> ${d.value.toLocaleString()}</p>
//                           <p><strong>Percentage of ${d.parent.data.name}:</strong> ${d.data.percentage}%</p>
//                           <p><strong>Percentage of All Housing:</strong> ${((d.value / root.value) * 100).toFixed(2)}%</p>
//                           ${incomeBreakdownHTML}
//                       `;
//                   }
                  
//                   tooltip.style('display', 'block')
//                       .html(tooltipContent)
//                       .style('left', (event.pageX + 10) + 'px')
//                       .style('top', (event.pageY - 28) + 'px');
//               })
//               .on("mouseout", function() {
//                   d3.select(this)
//                       .attr("stroke", "#fff")
//                       .attr("stroke-width", 1)
//                       .attr("opacity", d => d.depth === 1 ? 0.7 : 0.9);
                  
//                   tooltip.style('display', 'none');
//               });
          
//           // Add labels
//           node.append("text")
//               .attr("x", 4)
//               .attr("y", 14)
//               .attr("fill", d => d.depth === 1 ? "#fff" : "#000")
//               .attr("font-weight", d => d.depth === 1 ? "bold" : "normal")
//               .attr("font-size", d => d.depth === 1 ? "12px" : "10px")
//               .text(d => {
//                   const width = d.x1 - d.x0;
//                   const height = d.y1 - d.y0;
                  
//                   // Only show text if the cell is big enough
//                   if (width > 60 && height > 14) {
//                       if (d.depth === 1) {
//                           return `${d.data.name} (${d.data.percentage}%)`;
//                       } else if (width > 100 && height > 20) {
//                           return `${d.data.name} (${d.data.percentage}%)`;
//                       } else {
//                           return d.data.name;
//                       }
//                   }
//                   return '';
//               });
          
//           // Add event listener for color scheme change
//           document.getElementById('treemap-color').addEventListener('change', function() {
//               const newColorBy = this.value;
              
//               // Update rectangle colors
//               svg.selectAll('rect')
//                   .transition()
//                   .duration(500)
//                   .attr('fill', function(d) {
//                       if (d.depth === 1) {
//                           return boroughColorScale(d.data.name);
//                       } else if (newColorBy === 'borough') {
//                           return boroughColorScale(d.parent.data.name);
//                       } else {
//                           return constructionColorScale(d.data.name);
//                       }
//                   });
//           });
//       })
//       .catch(error => {
//           console.error('Error loading treemap:', error);
//           d3.select('#treemap').html(`<div class="error-message">Error loading treemap: ${error.message}</div>`);
//       });
// }

// // Add treemap to loadAllVisualizations function
// function loadAllVisualizations() {

//   loadTreemap(); // Make sure this is called
// }




