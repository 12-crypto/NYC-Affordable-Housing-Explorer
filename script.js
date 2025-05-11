const API_BASE_URL = 'http://localhost:5001';
let selectedBorough = 'all';
let selectedConstructionType = 'all';
let yearRange = [2000, 2025];
let currentK = 3;
let selectedDimension = 2;
let filteredData = null;
let currentPieType = 'construction';  // Persistent across reloads
let selectedIncomeCategory = 'all';   // track which category was clicked

let stackedInitialized    = false;
let stackedSvg, stackedG;
const hiddenCategories     = {};
let yearSunburstInitialized = false;
let sunburstInitialized = false,
    sunburstSvg,
    sunburstG,
    sunburstDefs;




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
    
     // bind the toggle **once**:
  document.getElementById('toggle-pie-btn')
  .addEventListener('click', () => {
    currentPieType = currentPieType === 'construction' ? 'borough' : 'construction';
    loadCombinedPieChart();
  });
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
    loadCombinedPieChart();
    //loadStackedBarChart();
    loadSunburstYearChart();
    loadGeoMap();
    loadSankeyDiagram();
    loadParallelCoordinates();
}


// Global variable to store the selected year
let selectedYear = null;

// Initialize year selector functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get the plus and minus buttons
  const plusBtn = document.querySelector('[data-quantity="plus"]');
  const minusBtn = document.querySelector('[data-quantity="minus"]');
  const yearInput = document.querySelector('input[name="year"]');
  
  // Handle plus button click
  plusBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get current, min, and max values
    let currentVal = parseInt(yearInput.value);
    const max = parseInt(yearInput.getAttribute('max'));
    
    // Increment value if not at max
    if (!isNaN(currentVal) && currentVal < max) {
      yearInput.value = currentVal + 1;
      
      // Trigger change event to update visualizations
      triggerYearChange(currentVal + 1);
    }
  });
  
  // Handle minus button click
  minusBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get current, min, and max values
    let currentVal = parseInt(yearInput.value);
    const min = parseInt(yearInput.getAttribute('min'));
    
    // Decrement value if not at min
    if (!isNaN(currentVal) && currentVal > min) {
      yearInput.value = currentVal - 1;
      
      // Trigger change event to update visualizations
      triggerYearChange(currentVal - 1);
    }
  });
  
  // Function to trigger year change event
  function triggerYearChange(year) {
    console.log(`Year changed to: ${year}`);
    
    // Create and dispatch custom event
    const event = new CustomEvent('yearChange', {
      detail: { year: year }
    });
    
    document.dispatchEvent(event);
    
    // You can also call your update function directly
    // updateVisualizationsByYear(year);
  }
  
  // Listen for year changes
  document.addEventListener('yearChange', function(e) {
    // Call function to update visualizations based on selected year
    updateVisualizationsByYear(e.detail.year);
  });
  
  // Function to update visualizations based on year
  function updateVisualizationsByYear(year) {
    // This function would contain the logic to update your visualizations
    // For example, filtering data by the selected year and redrawing charts
    
    // Example:
    // 1. Filter your data for the selected year
    // 2. Update your bar chart with the filtered data
    // 3. Update any other visualizations that depend on the year
    
    selectedYear = year;
  
  // Update visualizations with the new year filter
  loadBarChartByBorough();
  loadCombinedPieChart();
  loadGeoMap(); // Assuming you have this function
  
  console.log(`Visualizations updated for year: ${year}`);
 
  
  console.log(`Geo map updated for year: ${year}`);
    
    // Call your existing visualization update functions here
    // loadBarChartByBorough(year);
    // loadGeoMap(year);
    // etc.
  }
});


// Updated loadBarChartByBorough function with year parameter
function loadBarChartByBorough() {
    // Construct URL with year parameter if selected
    let url = `${API_BASE_URL}/borough_units`;
    if (selectedYear) {
        url += `?year=${selectedYear}`;
    }
    
    fetch(url)
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
                
            // Add title with year information
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -5)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text(`${selectedYear ? `(${selectedYear})` : ''}`);
                
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

// Updated createPieChart function to include title
function createPieChart(selector, data, labelKey, valueKey, title) {
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
        
    // Add title
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height/2 + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title);
        
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
            if (labelKey === 'type') {
              // user clicked a construction slice
              selectedConstructionType = d.data[labelKey];
              document.getElementById('construction-filter').value = selectedConstructionType;
          
              // reset borough filter so it doesn’t overfilter
              selectedBorough = 'all';
              document.getElementById('borough-filter').value = 'all';
          
            } else { // borough slice
              selectedBorough = d.data[labelKey];
              document.getElementById('borough-filter').value = selectedBorough;
          
              // reset construction filter
              selectedConstructionType = 'all';
              document.getElementById('construction-filter').value = 'all';
            }
          
            updateFilters();
          });
               
    // Add legend if there's space
    if (height > 200) {
        // keep the legend INSIDE the right half of the chart
const legendX = Math.min(radius + 10, width/2 - 80);

const legend = svg.selectAll('.legend')
  .data(data)
  .enter().append('g')
    .attr('class','legend')
    .attr('transform',(d,i)=>`translate(${legendX},${-radius + 20 + i*20})`);

            
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

function loadCombinedPieChart() {
    const pieContainer = document.getElementById('combined-pie');
    if (!pieContainer) return;
  
    let url = `${API_BASE_URL}/pie_data`;
    if (selectedYear) url += `?year=${selectedYear}`;
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const raw = currentPieType === 'construction' ? data.construction : data.borough;
  
        // apply only the relevant filter:
        // always show the full, aggregated distribution
const pieData = currentPieType === 'construction'
? data.construction
: data.borough;

  
        pieContainer.innerHTML = '';
        if (!pieData.length) {
          pieContainer.innerHTML = '<div class="error-message">No data available</div>';
          return;
        }
  
        const labelKey = currentPieType === 'construction' ? 'type' : 'borough';
        const title = `${currentPieType === 'construction' ? 'Construction' : 'Borough'} Distribution`;
  
        createPieChart('#combined-pie', pieData, labelKey, 'count', title);
      })
      .catch(err => {
        pieContainer.innerHTML = '<div class="error-message">Error loading chart</div>';
        console.error(err);
      });
  }
  

//   function loadStackedBarChart() {
//     const container = d3.select('#stacked-bar');
//     const w = container.node().clientWidth;
//     const h = container.node().clientHeight;
//     const margin = { top: 20, right: 80, bottom: 40, left: 50 };
//     const width  = w - margin.left - margin.right;
//     const height = h - margin.top  - margin.bottom;
  
//     // 1) Initialize SVG & axis groups only once
//     if (!stackedInitialized) {
//       stackedSvg = container.append('svg')
//         .attr('width',  w)
//         .attr('height', h);
  
//       stackedG = stackedSvg.append('g')
//         .attr('transform', `translate(${margin.left},${margin.top})`);
  
//       // placeholder for axes
//       stackedG.append('g').attr('class','y-axis');
//       stackedG.append('g').attr('class','x-axis')
//         .attr('transform', `translate(0,${height})`);
  
//       stackedInitialized = true;
//     }
  
//     // 2) Fetch & prepare data
//     d3.json(`${API_BASE_URL}/stacked_income`)
//       .then(rawData => {
//         // all boroughs & categories
//         const boroughs   = Array.from(new Set(rawData.map(d=>d.borough)));
//         const allCats    = Array.from(new Set(rawData.map(d=>d.category)));
  
//         // ensure every category has a hidden flag
//         allCats.forEach(cat => {
//           if (hiddenCategories[cat] === undefined) hiddenCategories[cat] = false;
//         });
  
//         // only show categories not hidden
//         const visibleCats = allCats.filter(cat => !hiddenCategories[cat]);
  
//         // build stack on VISIBLE categories
//         const series = d3.stack()
//           .keys(visibleCats)
//           .value((d,key)=> d.values[key]||0)
//           (boroughs.map(b => {
//             const vals = {};
//             rawData.filter(r => r.borough===b)
//                    .forEach(r => vals[r.category] = r.value);
//             return { borough: b, values: vals };
//           }));
  
//         // scales
//         const x = d3.scaleBand()
//           .domain(boroughs)
//           .range([0, width])
//           .padding(0.1);
//         const y = d3.scaleLinear()
//           .domain([0, d3.max(series[series.length-1], d=>d[1])])
//           .nice()
//           .range([height,0]);
//         const color = d3.scaleOrdinal(d3.schemeCategory10)
//           .domain(allCats);
  
//         // 3) Update axes
//         stackedG.select('.y-axis')
//           .transition().duration(300)
//           .call(d3.axisLeft(y).ticks(5));
//         stackedG.select('.x-axis')
//           .transition().duration(300)
//           .call(d3.axisBottom(x))
//           .selectAll('text')
//             .attr('transform','rotate(-45)')
//             .style('text-anchor','end');
  
//         // 4) JOIN layers
//         const layers = stackedG.selectAll('g.layer')
//           .data(series, d=>d.key);
//         layers.exit().remove();
//         const layersEnter = layers.enter().append('g')
//           .attr('class','layer')
//           .attr('data-key', d=>d.key)
//           .attr('fill', d=>color(d.key));
//         const layersMerge = layersEnter.merge(layers);
  
//         // 5) JOIN & UPDATE rects
//         layersMerge.each(function(layerData) {
//           const layer = d3.select(this);
//           const rects = layer.selectAll('rect')
//             .data(layerData, d=>d.data.borough + '|' + layerData.key);
//           rects.exit().remove();
  
//           const rectsEnter = rects.enter().append('rect')
//             .on('mouseover', (e,d) => {
//               tooltip.style('display','block')
//                      .html(`<strong>${d.data.borough}</strong><br/>
//                             ${(d[1]-d[0]).toLocaleString()} units`)
//                      .style('left',  (e.pageX+10)+'px')
//                      .style('top',   (e.pageY-20)+'px');
//             })
//             .on('mouseout', () => tooltip.style('display','none'))
//             .on('click', (e,d) => {
//               // pop & filter
//               selectedBorough = d.data.borough;
//               document.getElementById('borough-filter').value = selectedBorough;
//               selectedIncomeCategory = layerData.key;
//               updateFilters();
//             });
  
//           rectsEnter.merge(rects)
//             .transition().duration(300)
//               .attr('x',      d=>x(d.data.borough))
//               .attr('width',  x.bandwidth())
//               .attr('y',      d => {
//                 const base = y(d[1]);
//                 return (d.data.borough===selectedBorough && layerData.key===selectedIncomeCategory)
//                   ? base - 5
//                   : base;
//               })
//               .attr('height', d => {
//                 const segH = y(d[0]) - y(d[1]);
//                 return (d.data.borough===selectedBorough && layerData.key===selectedIncomeCategory)
//                   ? segH + 5
//                   : segH;
//               });
//         });
  
//         // 6) STATIC LEGEND WITH STRIKE-THROUGH TOGGLE
//         // remove old legend
//         stackedSvg.selectAll('g.stacked-legend').remove();
  
//         const legend = stackedSvg.append('g')
//           .attr('class','stacked-legend')
//           .attr('transform', `translate(${margin.left + width + 10},${margin.top})`);
  
//         allCats.forEach((cat,i) => {
//           const g = legend.append('g')
//             .attr('class','legend-item')
//             .attr('transform', `translate(0,${i*20})`)
//             .style('cursor','pointer')
//             .on('click', () => {
//               // toggle hidden state
//               hiddenCategories[cat] = !hiddenCategories[cat];
//               loadStackedBarChart();   // re-draw with new visibleCats
//             });
  
//           g.append('rect')
//             .attr('width', 10)
//             .attr('height', 10)
//             .attr('fill',  color(cat));
  
//           g.append('text')
//             .attr('x', 15)
//             .attr('y', 10)
//             .text(cat)
//             .style('font-size','10px')
//             .style('alignment-baseline','middle')
//             .style('text-decoration', hiddenCategories[cat] ? 'line-through' : 'none')
//             .style('opacity', hiddenCategories[cat] ? 0.5 : 1);
//         });
//       })
//       .catch(err => {
//         console.error('Error loading stacked bar data:', err);
//       });
//   }
  
  
function loadSunburstYearChart() {
    const container = d3.select('#sunburst-year');
    if (!container.node()) return;
  
    // compute dims
    const w = container.node().clientWidth;
    const h = container.node().clientHeight;
    const r = Math.min(w, h) / 2 - 10;
    const rightMargin = 80;  // matches your legend clamp
  
    // 1) INITIALIZE SVG + GROUPS ONCE
    if (!sunburstInitialized) {
      container.selectAll('*').remove();
  
      sunburstSvg = container.append('svg')
        .attr('width', w)
        .attr('height', h);
  
      // group for arcs
      sunburstG = sunburstSvg.append('g')
        .attr('transform', `translate(${w/2},${h/2})`);
  
      // defs for gradient
      sunburstDefs = sunburstSvg.append('defs');
  
      sunburstInitialized = true;
    }
  
    // 2) LOAD & PARTITION
    d3.json(`${API_BASE_URL}/sunburst_years`)
      .then(data => {
        const root = d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a,b) => b.value - a.value);
  
        d3.partition().size([2*Math.PI, r])(root);
  
        // year domain & color ramp
        const years = root.children.map(d => +d.data.name).sort((a,b)=>a-b);
        const yearColor = d3.scaleSequential()
          .domain([years[0], years[years.length-1]])
          .interpolator(d3.interpolateRgb("#deb887", "#8b4513"));
  
        // borough palette
        const boroughColors = {
          'Bronx':        '#ff7f0e',
          'Brooklyn':     '#1f77b4',
          'Manhattan':    '#2ca02c',
          'Queens':       '#d62728',
          'Staten Island':'#9467bd'
        };
  
        // arc generator
        const arc = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(  d => d.x1)
          .innerRadius(d => d.y0)
          .outerRadius(d => d.y1);
  
        // 3) JOIN PATHS
        const nodes = root.descendants().filter(d=>d.depth>0);
        const paths = sunburstG.selectAll('path.arc')
          .data(nodes, d=>`${d.data.name}|${d.depth}`);
  
        // exit old
        paths.exit().remove();
  
        // enter new
        const pathsEnter = paths.enter().append('path')
          .attr('class','arc')
          .attr('stroke','#fff')
          .on('mouseover',(e,d)=>{
            const label = d.depth===1
              ? `Year: ${d.data.name}`
              : `Borough: ${d.data.name}`;
            const info = d.depth===2
              ? `<br/>Units: ${d.value.toLocaleString()}`
              : '';
            tooltip.style('display','block')
                   .html(`<strong>${label}</strong>${info}`)
                   .style('left', (e.pageX+10)+'px')
                   .style('top',  (e.pageY-20)+'px');
          })
          .on('mouseout',()=>tooltip.style('display','none'))
          .on('click',(e,d)=>{
            if (d.depth===1) {
              selectedYear = +d.data.name;
              document.querySelector('input[name="year"]').value = selectedYear;
              updateFilters();
            }
          });
  
        // update + transition
        pathsEnter.merge(paths)
          .transition().duration(300)
          .attr('d', arc)
          .attr('fill', d => d.depth===1
            ? yearColor(+d.data.name)
            : boroughColors[d.data.name] || '#ccc'
          );
  
        // 4) UPDATE LEGENDS (static—replacing full redraw)
        // compute legend positions
        const legendX = w - rightMargin - 120;      // barWidth = 120
        const legendY = -r;
  
        // BOROUGH LEGEND
        // remove old, then re‐draw
        sunburstG.selectAll('g.borough-legend').remove();
        const bl = sunburstG.append('g')
          .attr('class','borough-legend')
          .attr('transform',`translate(${legendX},${legendY})`);
        Object.entries(boroughColors).forEach(([b,col], i) => {
          const g = bl.append('g')
            .attr('transform',`translate(0,${i*20})`);
          g.append('rect')
            .attr('width',10).attr('height',10)
            .attr('fill',col);
          g.append('text')
            .attr('x',15).attr('y',10)
            .text(b)
            .style('font-size','10px')
            .attr('alignment-baseline','middle');
        });
  
        // YEAR GRADIENT LEGEND
        sunburstDefs.selectAll('#yearGradient').remove();
        const grad = sunburstDefs.append('linearGradient')
          .attr('id','yearGradient')
          .attr('x1','0%').attr('y1','0%')
          .attr('x2','100%').attr('y2','0%');
  
        grad.append('stop')
          .attr('offset','0%')
          .attr('stop-color', yearColor(years[0]));
        grad.append('stop')
          .attr('offset','100%')
          .attr('stop-color', yearColor(years[years.length-1]));
  
        // position gradient bar
        const barY = legendY + Object.keys(boroughColors).length*20 + 20;
        sunburstG.selectAll('rect.year-bar').remove();
        sunburstG.append('rect')
          .attr('class','year-bar')
          .attr('x', legendX)
          .attr('y', barY)
          .attr('width', 120)
          .attr('height', 10)
          .style('fill','url(#yearGradient)');
  
        // min/max labels
        sunburstG.selectAll('text.year-label').remove();
        sunburstG.append('text')
          .attr('class','year-label')
          .attr('x', legendX)
          .attr('y', barY + 12)
          .text(years[0])
          .style('font-size','10px')
          .attr('alignment-baseline','hanging');
  
        sunburstG.append('text')
          .attr('class','year-label')
          .attr('x', legendX + 120)
          .attr('y', barY + 12)
          .text(years[years.length-1])
          .style('font-size','10px')
          .attr('text-anchor','end')
          .attr('alignment-baseline','hanging');
      })
      .catch(err => console.error('Error loading sunburst_years:', err));
  }
  
  
  

// // Update the document ready function to initialize the year selector
// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize tooltips, filters, etc.
//     // ...
    
//     // Initialize year selector
//     initYearSelector();
    
//     // Load all visualizations
//     loadAllVisualizations();
// });

// Load all visualizations
function loadAllVisualizations() {
  loadBarChartByBorough();
  loadCombinedPieChart();
  //loadStackedBarChart();
  loadSunburstYearChart();
  //loadSunburstYearChart();
  loadGeoMap();
  // Other visualization functions...
}


// Global variables for map settings
let mapColorBy = 'Borough';
let mapSizeBy = 'Total Units';
let map = null;
let mapLegend = null;

function loadGeoMap() {
  // Get filter values from select elements (if they exist)
  const colorBySelect = document.getElementById('map-color-by');
  const sizeBySelect = document.getElementById('map-size-by');
  
  if (colorBySelect) mapColorBy = colorBySelect.value;
  if (sizeBySelect) mapSizeBy = sizeBySelect.value;
  
  // Construct URL with year parameter if selected
  let url = `${API_BASE_URL}/geo_data`;
  if (selectedYear) {
    url += `?year=${selectedYear}`;
  }
  
  fetch(url)
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
          
          // Clear previous map if it exists
          if (map) {
              map.remove();
          }
          
          // Create map
          const mapContainer = document.getElementById('geo-map');
          map = L.map(mapContainer, {
              zoomAnimation: false,
              markerZoomAnimation: false
          }).setView([40.7128, -74.0060], 11);
          
          // Store active tooltip globally
          let activeTooltip = null;
          
          // Add click handler to close tooltips when clicking on the map
          map.on('click', function(e) {
              // Close all tooltips when clicking on the map
              if (activeTooltip) {
                  activeTooltip.closeTooltip();
                  activeTooltip = null;
              }
              
              // Close all popups when clicking on the map (but not on markers)
              if (!e.originalEvent._stopped) {
                  map.closePopup();
              }
          });
          
          // Make popups interactive
          map.on('popupopen', function(e) {
              const popup = e.popup;
              const container = popup.getElement();
              
              // Prevent clicks inside popup from closing it
              L.DomEvent.disableClickPropagation(container);
              
              // Allow scrolling inside popup without zooming the map
              L.DomEvent.disableScrollPropagation(container);
          });
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Color scales
          const boroughColors = {
              'Bronx': '#ff7f0e',
              'Brooklyn': '#1f77b4',
              'Manhattan': '#2ca02c',
              'Queens': '#d62728',
              'Staten Island': '#9467bd'
          };
          
          const constructionColors = {
              'New Construction': '#8c564b',
              'Preservation': '#e377c2',
              'Unknown': '#7f7f7f'
          };
          
          // Find max value for size scaling
          const maxValue = d3.max(data, d => +d[mapSizeBy] || 0);
          
          // Add points
          data.forEach(d => {
              // Determine color based on selected color attribute
              let color;
              if (mapColorBy === 'Borough') {
                  color = boroughColors[d.Borough] || '#888888';
              } else if (mapColorBy === 'Construction Type') {
                  color = constructionColors[d['Construction Type']] || '#888888';
              }
              
              // Calculate radius based on selected size attribute
              // Use square root scale for better visual representation
              const value = +d[mapSizeBy] || 0;
              const radius = Math.sqrt(value / maxValue) * 20;
              
              const circle = L.circleMarker([d.Latitude, d.Longitude], {
                  radius: Math.max(radius, 1), // Minimum radius of 1
                  fillColor: color,
                  color: '#fff',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8,
                  className: 'custom-marker',
                  bubblingMouseEvents: false, // Prevent event bubbling
                  riseOnHover: false // Prevent z-index changes on hover
              }).addTo(map);
              
              // Extract year from Project Start Date for display
              const projectDate = d['Project Start Date'] || 'Unknown date';
              const projectYear = projectDate !== 'Unknown date' ? projectDate.split('/').pop() : 'Unknown year';
              
              // Create tooltip content
              const tooltipContent = `
                  <strong>${d['Project Name'] || 'Unnamed Project'}</strong><br>
                  ${d.Borough}<br>
                  ${d['Total Units']} units<br>
                  Year: ${projectYear}
              `;
              
              // Create popup content with more details
              const popupContent = `
                  <div class="popup-content">
                      <h4>${d['Project Name'] || 'Unnamed Project'}</h4>
                      <p><strong>Borough:</strong> ${d.Borough}</p>
                      <p><strong>Total Units:</strong> ${d['Total Units']}</p>
                      <p><strong>Construction Type:</strong> ${d['Construction Type']}</p>
                      <p><strong>Project Date:</strong> ${projectDate}</p>
                      <p><strong>Income Units:</strong></p>
                      <ul>
                          <li>Extremely Low: ${d['Extremely Low Income Units'] || 0}</li>
                          <li>Very Low: ${d['Very Low Income Units'] || 0}</li>
                          <li>Low: ${d['Low Income Units'] || 0}</li>
                          <li>Moderate: ${d['Moderate Income Units'] || 0}</li>
                          <li>Middle: ${d['Middle Income Units'] || 0}</li>
                          <li>Other: ${d['Other Income Units'] || 0}</li>
                      </ul>
                  </div>
              `;
              
              // Bind tooltip with fixed position and no auto-open
//               // Bind tooltip with fixed position and no auto-open
              circle.bindTooltip(tooltipContent, {
                  direction: 'top',
                  offset: L.point(0, -radius -1), // Extra offset to prevent overlap
                  sticky: false, // Don't follow cursor
                  opacity: 0.9,
                  className: 'custom-tooltip',
                  permanent: false
              });
              
              // Disable default tooltip behavior (important!)
              circle.off('mouseover');
              circle.off('mouseout');
              
              // Bind popup
              circle.bindPopup(popupContent, {
                  maxWidth: 300,
                  className: 'custom-popup',
                  closeButton: true,
                  closeOnClick: false  // Prevents popup from closing when clicking inside it
              });
              
              // Handle click event for both tooltip and popup
              circle.on('click', function(e) {
                  // Stop event propagation
                  L.DomEvent.stopPropagation(e);
                  
                  // Close any previously open tooltip
                  if (activeTooltip && activeTooltip !== this) {
                      activeTooltip.closeTooltip();
                  }
                  
                  // Toggle tooltip
                  if (activeTooltip === this) {
                      this.closeTooltip();
                      activeTooltip = null;
                  } else {
                      this.openTooltip();
                      activeTooltip = this;
                  }
                  
                  // Open popup
                  this.openPopup();
              });
          });
          
          // Add legend with year information
          addMapLegend(data);
          
          // Fit bounds to data points
          if (data.length > 0) {
              const bounds = L.latLngBounds(data.map(d => [d.Latitude, d.Longitude]));
              map.fitBounds(bounds);
          }
      })
      .catch(error => {
          console.error('Error loading geo map:', error);
          document.getElementById('geo-map').innerHTML = `<div class="error-message">Error loading map data: ${error.message}</div>`;
      });
}

// Update the legend to include year information
function addMapLegend(data) {
  // Remove existing legend if it exists
  if (mapLegend) {
      map.removeControl(mapLegend);
  }
  
  mapLegend = L.control({position: 'bottomright'});
  
  mapLegend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      
      // Add year information to legend title if year is selected
      let title = selectedYear ? 
          `<div style="margin-bottom:10px;"><strong>${mapColorBy} (${selectedYear})</strong></div>` : 
          `<div style="margin-bottom:10px;"><strong>${mapColorBy}</strong></div>`;
      
      let content = title;
      
      // Add color legend based on selected attribute
      if (mapColorBy === 'Borough') {
          const boroughColors = {
              'Bronx': '#ff7f0e',
              'Brooklyn': '#1f77b4',
              'Manhattan': '#2ca02c',
              'Queens': '#d62728',
              'Staten Island': '#9467bd'
          };
          
          for (const borough in boroughColors) {
              content += `<div><i style="background:${boroughColors[borough]}; width:15px; height:15px; display:inline-block; margin-right:5px; opacity:0.7;"></i> ${borough}</div>`;
          }
      } else if (mapColorBy === 'Construction Type') {
          const constructionColors = {
              'New Construction': '#8c564b',
              'Preservation': '#e377c2',
              'Unknown': '#7f7f7f'
          };
          
          for (const type in constructionColors) {
              content += `<div><i style="background:${constructionColors[type]}; width:15px; height:15px; display:inline-block; margin-right:5px; opacity:0.7;"></i> ${type}</div>`;
          }
      }
      
      // Add size legend
      content += `<div style="margin-top:10px;"><strong>Size: ${mapSizeBy}</strong></div>`;
      
      const maxValue = d3.max(data, d => +d[mapSizeBy] || 0);
      const sizes = [maxValue, maxValue/2, maxValue/4];
      
      sizes.forEach(size => {
          const radius = Math.sqrt(size / maxValue) * 20;
          if (radius > 0) {
              content += `
                  <div style="margin-bottom:5px; clear:both;">
                      <svg height="${radius*2+2}" width="${radius*2+2}" style="float:left; margin-right:8px;">
                          <circle cx="${radius+1}" cy="${radius+1}" r="${radius}" fill="#3388ff" opacity="0.7" stroke="white" stroke-width="1"></circle>
                      </svg>
                      <span style="line-height:${radius*2}px;">${Math.round(size)} units</span>
                  </div>
              `;
          }
      });
      
      div.innerHTML = content;
      return div;
  };
  
  mapLegend.addTo(map);
}


// Function to add legend to map
function addMapLegend(data) {
    // Remove existing legend if it exists
    if (mapLegend) {
        map.removeControl(mapLegend);
    }
    
    mapLegend = L.control({position: 'bottomright'});
    
    mapLegend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        
        // Color legend
        let content = `<h4>${mapColorBy}</h4>`;
        
        if (mapColorBy === 'Borough') {
            const boroughColors = {
                'Bronx': '#ff7f0e',
                'Brooklyn': '#1f77b4',
                'Manhattan': '#2ca02c',
                'Queens': '#d62728',
                'Staten Island': '#9467bd'
            };
            
            for (const borough in boroughColors) {
                content += `<div><i style="background:${boroughColors[borough]}; width:15px; height:15px; display:inline-block; margin-right:5px; opacity:0.7;"></i> ${borough}</div>`;
            }
        } else if (mapColorBy === 'Construction Type') {
            const constructionColors = {
                'New Construction': '#8c564b',
                'Preservation': '#e377c2',
                'Unknown': '#7f7f7f'
            };
            
            for (const type in constructionColors) {
                content += `<div><i style="background:${constructionColors[type]}; width:15px; height:15px; display:inline-block; margin-right:5px; opacity:0.7;"></i> ${type}</div>`;
            }
        }
        
        // Size legend
        content += `<h4 style="margin-top:10px;">Size: ${mapSizeBy}</h4>`;
        
        const maxValue = d3.max(data, d => +d[mapSizeBy] || 0);
        const sizes = [maxValue, maxValue/2, maxValue/4];
        
        sizes.forEach(size => {
            const radius = Math.sqrt(size / maxValue) * 20;
            if (radius > 0) {
                content += `
                    <div style="margin-bottom:5px; clear:both;">
                        <svg height="${radius*2+2}" width="${radius*2+2}" style="float:left; margin-right:8px;">
                            <circle cx="${radius+1}" cy="${radius+1}" r="${radius}" fill="#3388ff" opacity="0.7" stroke="white" stroke-width="1"></circle>
                        </svg>
                        <span style="line-height:${radius*2}px;">${Math.round(size)} units</span>
                    </div>
                `;
            }
        });
        
        div.innerHTML = content;
        return div;
    };
    
    mapLegend.addTo(map);
}
// Function to update map settings when controls change
function updateMapSettings() {
  const colorBySelect = document.getElementById('map-color-by');
  const sizeBySelect = document.getElementById('map-size-by');
  
  if (colorBySelect) mapColorBy = colorBySelect.value;
  if (sizeBySelect) mapSizeBy = sizeBySelect.value;
  
  // Reload the map with new settings
  loadGeoMap();
}


// function loadSankeyPlot() {
//   fetch('http://localhost:5001/sankey_data')
//     .then(response => response.json())
//     .then(data => {
//       if (!data.nodes || !data.links) throw new Error('Invalid Sankey data format');
      
//       // Set up dimensions
//       const margin = {top: 30, right: 150, bottom: 20, left: 150};
//       const width = document.getElementById('sankey-diagram').clientWidth - margin.left - margin.right;
//       const height = document.getElementById('sankey-diagram').clientHeight - margin.top - margin.bottom;
      
//       // Clear previous chart
//       d3.select('#sankey-diagram').html('');
      
//       // Create SVG with a light background
//       const svg = d3.select('#sankey-diagram')
//         .append('svg')
//         .attr('width', width + margin.left + margin.right)
//         .attr('height', height + margin.top + margin.bottom)
//         .append('g')
//         .attr('transform', `translate(${margin.left},${margin.top})`);
      
//       // Create Sankey generator
//       const sankey = d3.sankey()
//         .nodeWidth(25)
//         .nodePadding(15)
//         .extent([[1, 1], [width - 1, height - 5]]);
      
//       // Format the data for the Sankey layout
//       const graph = sankey({
//         nodes: data.nodes.map(d => Object.assign({}, d)),
//         links: data.links.map(d => Object.assign({}, d))
//       });
      
//       // Create vibrant color scales for nodes
//       const boroughColors = {
//         'Bronx': '#FF6B6B',
//         'Brooklyn': '#4ECDC4',
//         'Manhattan': '#45B7D1',
//         'Queens': '#FFA62B',
//         'Staten Island': '#845EC2'
//       };
      
//       const incomeColors = {
//         'Extremely Low Income Units': '#1E3A8A',
//         'Very Low Income Units': '#1E40AF',
//         'Low Income Units': '#2563EB',
//         'Moderate Income Units': '#3B82F6',
//         'Middle Income Units': '#60A5FA',
//         'Other Income Units': '#93C5FD'
//       };
      
//       // Function to get node color
//       function getNodeColor(node) {
//         if (boroughColors[node.name]) {
//           return boroughColors[node.name];
//         } else if (incomeColors[node.name]) {
//           return incomeColors[node.name];
//         }
//         return '#888888'; // Default color
//       }
      
//       // Create gradient definitions for links
//       const defs = svg.append('defs');
      
//       // Create gradients for each link
//       graph.links.forEach((link, i) => {
//         const gradientId = `link-gradient-${i}`;
//         const gradient = defs.append('linearGradient')
//           .attr('id', gradientId)
//           .attr('gradientUnits', 'userSpaceOnUse')
//           .attr('x1', link.source.x1)
//           .attr('x2', link.target.x0);
        
//         // Start color (source node color)
//         gradient.append('stop')
//           .attr('offset', '0%')
//           .attr('stop-color', getNodeColor(link.source))
//           .attr('stop-opacity', 0.8);
        
//         // End color (target node color)
//         gradient.append('stop')
//           .attr('offset', '100%')
//           .attr('stop-color', getNodeColor(link.target))
//           .attr('stop-opacity', 0.8);
//       });
      
//       // Add links with gradients and improved styling
//       const link = svg.append('g')
//         .selectAll('.link')
//         .data(graph.links)
//         .enter()
//         .append('path')
//         .attr('class', 'link')
//         .attr('d', d3.sankeyLinkHorizontal())
//         .attr('stroke-width', d => Math.max(1, d.width))
//         .attr('stroke', (d, i) => `url(#link-gradient-${i})`)
//         .style('fill', 'none')
//         .style('stroke-opacity', 0.7)
//         .on('mouseover', function(event, d) {
//           // Highlight this link
//           d3.select(this)
//             .style('stroke-opacity', 1)
//             .attr('stroke-width', d => Math.max(1, d.width + 2));
          
//           // Highlight connected nodes
//           node.filter(n => n === d.source || n === d.target)
//             .style('stroke', '#000')
//             .style('stroke-width', 2);
          
//           // Show tooltip
//           const tooltip = d3.select("body").append("div")
//             .attr("class", "tooltip")
//             .style("display", "block")
//             .style("position", "absolute")
//             .style("background", "rgba(0,0,0,0.8)")
//             .style("color", "white")
//             .style("padding", "10px")
//             .style("border-radius", "5px")
//             .style("font-size", "12px")
//             .style("pointer-events", "none")
//             .style("z-index", 1000)
//             .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)");
          
//           tooltip.html(`
//             <strong>${d.source.name} → ${d.target.name}</strong><br>
//             ${d.value.toLocaleString()} units (${(d.value / d.source.value * 100).toFixed(1)}%)
//           `)
//             .style('left', (event.pageX + 10) + 'px')
//             .style('top', (event.pageY - 20) + 'px');
//         })
//         .on('mouseout', function() {
//           // Reset styles
//           d3.select(this)
//             .style('stroke-opacity', 0.7)
//             .attr('stroke-width', d => Math.max(1, d.width));
          
//           // Reset node highlighting
//           node.style('stroke', '#fff')
//             .style('stroke-width', 1);
          
//           // Remove tooltip
//           d3.select("body").selectAll(".tooltip").remove();
//         });
      
//       // Add nodes with enhanced styling
//       const node = svg.append('g')
//         .selectAll('.node')
//         .data(graph.nodes)
//         .enter()
//         .append('g')
//         .attr('class', 'node')
//         .attr('transform', d => `translate(${d.x0},${d.y0})`);
      
//       // Add rectangles for nodes with improved styling
//       node.append('rect')
//         .attr('height', d => Math.max(d.y1 - d.y0, 10))
//         .attr('width', d => d.x1 - d.x0)
//         .attr('fill', d => getNodeColor(d))
//         .attr('stroke', '#fff')
//         .attr('stroke-width', 1)
//         .attr('rx', 4) // Rounded corners
//         .attr('ry', 4)
//         .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.2))')
//         .on('mouseover', function(event, d) {
//           // Highlight connected links
//           link.style('stroke-opacity', l => 
//             l.source === d || l.target === d ? 1 : 0.1
//           );
          
//           // Increase stroke width for connected links
//           link.style('stroke-width', l => 
//             l.source === d || l.target === d ? 
//             Math.max(1, l.width + 2) : Math.max(1, l.width)
//           );
          
//           // Highlight this node
//           d3.select(this)
//             .style('stroke', '#000')
//             .style('stroke-width', 2);
          
//           // Show tooltip with node details
//           const tooltip = d3.select("body").append("div")
//             .attr("class", "tooltip")
//             .style("display", "block")
//             .style("position", "absolute")
//             .style("background", "rgba(0,0,0,0.8)")
//             .style("color", "white")
//             .style("padding", "10px")
//             .style("border-radius", "5px")
//             .style("font-size", "12px")
//             .style("pointer-events", "none")
//             .style("z-index", 1000)
//             .style("box-shadow", "0 4px 8px rgba(0,0,0,0.2)");
          
//           let tooltipContent = `<strong>${d.name}</strong><br>Total: ${d.value.toLocaleString()} units`;
          
//           // If it's a borough, show outgoing flows
//           if (boroughColors[d.name]) {
//             tooltipContent += '<br><br>Distribution:';
//             d.sourceLinks.forEach(link => {
//               tooltipContent += `<br>${link.target.name}: ${link.value.toLocaleString()} (${(link.value / d.value * 100).toFixed(1)}%)`;
//             });
//           } 
//           // If it's an income category, show incoming flows
//           else if (incomeColors[d.name]) {
//             tooltipContent += '<br><br>Sources:';
//             d.targetLinks.forEach(link => {
//               tooltipContent += `<br>${link.source.name}: ${link.value.toLocaleString()} (${(link.value / d.value * 100).toFixed(1)}%)`;
//             });
//           }
          
//           tooltip.html(tooltipContent)
//             .style('left', (event.pageX + 10) + 'px')
//             .style('top', (event.pageY - 20) + 'px');
//         })
//         .on('mouseout', function() {
//           // Reset link opacity
//           link.style('stroke-opacity', 0.7)
//             .style('stroke-width', d => Math.max(1, d.width));
          
//           // Reset node stroke
//           d3.select(this)
//             .style('stroke', '#fff')
//             .style('stroke-width', 1);
          
//           // Remove tooltip
//           d3.select("body").selectAll(".tooltip").remove();
//         });
      
//       // Add labels with improved styling
//       node.append('text')
//         .attr('x', d => d.x0 < width / 2 ? -8 : d.x1 - d.x0 + 8)
//         .attr('y', d => (d.y1 - d.y0) / 2)
//         .attr('dy', '0.35em')
//         .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
//         .text(d => d.name)
//         .style('font-size', '12px')
//         .style('font-family', "'Poppins', sans-serif")
//         .style('font-weight', 'bold')
//         .style('pointer-events', 'none')
//         .style('fill', d => {
//           // Use white text for dark backgrounds, black for light
//           const color = d3.color(getNodeColor(d));
//           return color.l < 0.5 ? '#fff' : '#000';
//         });
      
//       // Add value labels with improved styling
//       node.append('text')
//         .attr('x', d => d.x0 < width / 2 ? -8 : d.x1 - d.x0 + 8)
//         .attr('y', d => (d.y1 - d.y0) / 2 + 14)
//         .attr('dy', '0.35em')
//         .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
//         .text(d => `${d.value.toLocaleString()} units`)
//         .style('font-size', '10px')
//         .style('font-family', "'Poppins', sans-serif")
//         .style('pointer-events', 'none')
//         .style('fill', d => {
//           const color = d3.color(getNodeColor(d));
//           return color.l < 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
//         });
      
     
//     })
//     .catch(error => {
//       console.error('Error loading Sankey diagram:', error);
//       d3.select('#sankey-diagram').html(`
//         <div style="text-align: center; padding: 20px; color: #d63031; background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//           <h3>Error Loading Diagram</h3>
//           <p>${error.message}</p>
//           <button onclick="loadSankeyPlot()" style="background: #0984e3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
//             Retry
//           </button>
//         </div>
//       `);
//     });
// }

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
        
        // Extract borough names and income categories from nodes
        const boroughs = data.nodes
          .filter(n => !n.name.includes('Units'))
          .map(n => n.name);
        
        const incomeCategories = data.nodes
          .filter(n => n.name.includes('Units'))
          .map(n => n.name);
        
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
        
        // Add a title to the diagram
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .style('font-family', "'Poppins', sans-serif")
      })
      .catch(error => {
        console.error('Error loading Sankey diagram:', error);
        d3.select('#sankey-diagram').html(`
          <div style="text-align: center; padding: 20px; color: #d63031; background: #f8f9fa; border-radius: 8px);">
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

