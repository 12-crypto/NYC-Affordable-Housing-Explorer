const API_BASE_URL = 'http://localhost:5001';
let selectedBorough = 'all';
let selectedConstructionType = 'all';
let yearRange = [2000, 2025];
let currentK = 3;
let selectedDimension = 2;
let filteredData = null;
let currentPieType = 'construction';  
let selectedIncomeCategory = 'all';   

let stackedInitialized    = false;
let stackedSvg, stackedG;
const hiddenCategories     = {};
let yearSunburstInitialized = false;
let sunburstInitialized = false,
    sunburstSvg,
    sunburstG,
    sunburstDefs;

      const boroughColors = {
        'Bronx':        '#ff7f0e',
        'Brooklyn':     '#1f77b4',
        'Manhattan':    '#2ca02c',
        'Queens':       '#d62728',
        'Staten Island':'#9467bd'
      };    


const tooltip = d3.select('#tooltip');



function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


document.addEventListener('DOMContentLoaded', () => {
    
    initializeFilters();
    
 
    loadAllVisualizations();
    
    
    document.getElementById('borough-filter').addEventListener('change', updateFilters);
    document.getElementById('construction-filter').addEventListener('change', updateFilters);
   
    
     
  document.getElementById('toggle-pie-btn')
  .addEventListener('click', () => {
    currentPieType = currentPieType === 'construction' ? 'borough' : 'construction';
    loadCombinedPieChart();
  });
    
    document.getElementById('reset-pcp').addEventListener('click', resetPCPBrushes);
});


function initializeFilters() {
    
    fetch(`${API_BASE_URL}/full_pcp_data`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            
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
  

function updateYearRange() {
    const minYear = parseInt(document.getElementById('year-min').value);
    const maxYear = parseInt(document.getElementById('year-max').value);
    

    if (minYear > maxYear) {
        if (this.id === 'year-min') {
            document.getElementById('year-min').value = maxYear;
        } else {
            document.getElementById('year-max').value = minYear;
        }
    }
    
   
    const minDisplay = document.getElementById('year-min').value;
    const maxDisplay = document.getElementById('year-max').value;
    document.getElementById('year-display').textContent = `${minDisplay}-${maxDisplay}`;
    
    yearRange = [parseInt(minDisplay), parseInt(maxDisplay)];
    

    debounce(() => loadAllVisualizations(), 300)();
}


function resetPCPBrushes() {

    loadParallelCoordinates();
}

// Load all visualizations
function loadAllVisualizations() {
    loadBarChartByBorough();
    loadCombinedPieChart();
    loadSunburstYearChart();
    loadGeoMap();
    loadSankeyPlot();
    loadParallelCoordinates();
}



let selectedYear = null;


document.addEventListener('DOMContentLoaded', function() {
  
  const plusBtn = document.querySelector('[data-quantity="plus"]');
  const minusBtn = document.querySelector('[data-quantity="minus"]');
  const yearInput = document.querySelector('input[name="year"]');
  
  
  plusBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    
    let currentVal = parseInt(yearInput.value);
    const max = parseInt(yearInput.getAttribute('max'));
    
    if (!isNaN(currentVal) && currentVal < max) {
      yearInput.value = currentVal + 1;
      
      triggerYearChange(currentVal + 1);
    }
  });
  
  
  minusBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    let currentVal = parseInt(yearInput.value);
    const min = parseInt(yearInput.getAttribute('min'));
    

    if (!isNaN(currentVal) && currentVal > min) {
      yearInput.value = currentVal - 1;
      
     
      triggerYearChange(currentVal - 1);
    }
  });
  
 
  function triggerYearChange(year) {
    console.log(`Year changed to: ${year}`);

    const event = new CustomEvent('yearChange', {
      detail: { year: year }
    });
    
    document.dispatchEvent(event);
    
   
  }
  

  document.addEventListener('yearChange', function(e) {
  
    updateVisualizationsByYear(e.detail.year);
  });
  

  function updateVisualizationsByYear(year) {
   
    selectedYear = year;
  
  
  loadBarChartByBorough();
  loadCombinedPieChart();
  loadGeoMap(); 
  
  console.log(`Visualizations updated for year: ${year}`);
 
  
  console.log(`Geo map updated for year: ${year}`);
    
   
  }
});



function loadBarChartByBorough() {
    
    let url = `${API_BASE_URL}/borough_units`;
    if (selectedYear) {
        url += `?year=${selectedYear}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Invalid data format');
            
          
            if (selectedBorough !== 'all') {
                data = data.filter(d => d.Borough === selectedBorough);
            }
            
            
            const margin = {top: 20, right: 20, bottom: 60, left: 60};
            const width = document.getElementById('borough-chart').clientWidth - margin.left - margin.right;
            const height = document.getElementById('borough-chart').clientHeight - margin.top - margin.bottom;
            
           
            d3.select('#borough-chart').html('');
            
            
            const svg = d3.select('#borough-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
                
           
            const x = d3.scaleBand()
                .domain(data.map(d => d.Borough))
                .range([0, width])
                .padding(0.2);
                
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d['Total Units'])])
                .range([height, 0]);
                
          
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end');
                
            svg.append('g')
                .call(d3.axisLeft(y));
                
          
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -5)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text(`${selectedYear ? `(${selectedYear})` : ''}`);
                
      
            svg.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.Borough))
                .attr('width', x.bandwidth())
                .attr('y', d => y(d['Total Units']))
                .attr('height', d => height - y(d['Total Units']))
                .attr('fill', d => boroughColors[d.Borough] || '#ccc')
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
                    document.getElementById('borough-filter').value = d.Borough;
                    updateFilters();
                });
        })
        .catch(error => {
            console.error('Error loading borough chart:', error);
            d3.select('#borough-chart').html(`<div class="error-message">Error loading data</div>`);
        });
}


function createPieChart(selector, data, labelKey, valueKey, title) {

    const width = document.querySelector(selector).clientWidth;
    const height = document.querySelector(selector).clientHeight;
    const radius = Math.min(width, height) / 2 - 20;
    
    d3.select(selector).html('');
    
    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
        
    
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height/2 + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title);

         
   const titleSpace = 20;
        
       const chartG = svg.append('g')
      .attr('class','chart-content')
         .attr('transform', `translate(0, ${titleSpace})`);
        
    
    let color;
    if (labelKey === 'type') {
      
      color = d3.scaleOrdinal()
        .domain(data.map(d => d[labelKey]))
        .range([
          '#e377c2', 
          '#8c564b', 
        ]);
    } else {
     
      color = d3.scaleOrdinal()
        .domain(data.map(d => d[labelKey]))
        .range(data.map(d => boroughColors[d[labelKey]]));
    }
    

    const pie = d3.pie()
        .value(d => d[valueKey])
        .sort(null);
        
   
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
        
 
    const arcs = chartG.selectAll('.arc')
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
              
              selectedConstructionType = d.data[labelKey];
              document.getElementById('construction-filter').value = selectedConstructionType;
          
              
              selectedBorough = 'all';
              document.getElementById('borough-filter').value = 'all';
          
            } else { 
              selectedBorough = d.data[labelKey];
              document.getElementById('borough-filter').value = selectedBorough;
          
              selectedConstructionType = 'all';
              document.getElementById('construction-filter').value = 'all';
            }
          
            updateFilters();
          });
               
  
    if (height > 200) {
        
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
  
        
const pieData = currentPieType === 'construction'
? data.construction
: data.borough;

  
        pieContainer.innerHTML = '';
        if (!pieData.length) {
          pieContainer.innerHTML = '<div class="error-message">No data available</div>';
          return;
        }
  
        const labelKey = currentPieType === 'construction' ? 'type' : 'borough';
        const title = `${currentPieType === 'construction' ? 'Construction Type' : 'Borough'} Distribution`;
  
        createPieChart('#combined-pie', pieData, labelKey, 'count', title);
      })
      .catch(err => {
        pieContainer.innerHTML = '<div class="error-message">Error loading chart</div>';
        console.error(err);
      });
  }

  
function loadSunburstYearChart() {
    const container = d3.select('#sunburst-year');
    if (!container.node()) return;
  

    const w = container.node().clientWidth;
    const h = container.node().clientHeight;
    const r = Math.min(w, h) / 2 - 10;
    const rightMargin = 190;  
    

    if (!sunburstInitialized) {
      container.selectAll('*').remove();
  
      sunburstSvg = container.append('svg')
        .attr('width', w)
        .attr('height', h);
  
 
      sunburstG = sunburstSvg.append('g')
        .attr('transform', `translate(${w/2},${h/2})`);
  

      sunburstDefs = sunburstSvg.append('defs');
  
      sunburstInitialized = true;
    }
  

    d3.json(`${API_BASE_URL}/sunburst_years`)
      .then(data => {
        const root = d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a,b) => b.value - a.value);
  
        d3.partition().size([2*Math.PI, r])(root);
  

        const years = root.children.map(d => +d.data.name).sort((a,b)=>a-b);
        const yearColor = d3.scaleSequential()
          .domain([years[0], years[years.length-1]])
          .interpolator(d3.interpolateRgb("#a3e4d7" ,  "#0e6251"));

        const boroughColors = {
          'Bronx':        '#ff7f0e',
          'Brooklyn':     '#1f77b4',
          'Manhattan':    '#2ca02c',
          'Queens':       '#d62728',
          'Staten Island':'#9467bd'
        };
  
    
        const arc = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(  d => d.x1)
          .innerRadius(d => d.y0)
          .outerRadius(d => d.y1);

          const arcExpanded = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(  d => d.x1)
          .innerRadius(d => d.y0)
          .outerRadius(d => d.y1 + 20);  
  
 
        const nodes = root.descendants().filter(d=>d.depth>0);
        const paths = sunburstG.selectAll('path.arc')
          .data(nodes, d=>`${d.data.name}|${d.depth}`);
  

        paths.exit().remove();
  

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
    
        .on('click', (event, d) => {
            if (d.depth !== 1) return;   
          
            
            sunburstG.selectAll('path.arc.expanded')
              .classed('expanded', false)
              .transition().duration(300)
              .attrTween('d', dd => d3.interpolatePath( arcExpanded(dd), arc(dd) ));
          
            
            const thisPath = d3.select(event.currentTarget);
            const expanding = !thisPath.classed('expanded');
          
           
            sunburstG.selectAll('text.selected-year').remove();
          
            if (expanding) {
              
              thisPath.classed('expanded', true)
                .transition().duration(300)
                .attrTween('d', dd => d3.interpolatePath( arc(dd), arcExpanded(dd) ));
          
 
              const [cx, cy] = arcExpanded.centroid(d);
              sunburstG.append('text')
                .attr('class','selected-year')
                .attr('x', cx)
                .attr('y', cy)
                .text(d.data.name)
                .style('font-size','14px')
                .style('fill','#fff')
                .style('text-anchor','middle')
                .style('alignment-baseline','middle')
                .style('pointer-events','none');
            }
          
      
            selectedYear = +d.data.name;
            updateFilters();
          })
          
  
      
        pathsEnter.merge(paths)
          .transition().duration(300)
          .attr('d', arc)
          .attr('fill', d => d.depth===1
            ? yearColor(+d.data.name)
            : boroughColors[d.data.name] || '#ccc'
          );
  
       
        const legendX = w - rightMargin - 125;      
        const legendY = -r;
        const barY    = legendY + 400;  
        
  
    
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

sunburstDefs.selectAll('#yearGradient').remove();

const grad = sunburstDefs.append('linearGradient')
  .attr('id','yearGradient')
  .attr('x1','0%').attr('y1','0%')
  .attr('x2','0%').attr('y2','100%');

grad.append('stop')
  .attr('offset','0%')
  .attr('stop-color', yearColor(years[years.length - 1])); 

grad.append('stop')
  .attr('offset','100%')
  .attr('stop-color', yearColor(years[0]));              


sunburstG.selectAll('rect.year-bar').remove();
sunburstG.append('rect')
  .attr('class','year-bar')
  .attr('x', legendX)
  .attr('y', barY)
  .attr('width', 10)
  .attr('height', 120)
  .style('fill', 'url(#yearGradient)');


sunburstG.selectAll('text.year-label').remove();
sunburstG.append('text')
  .attr('class','year-label')
  .attr('x', legendX + 14)
  .attr('y', barY)
  .text(years[years.length - 1])
  .style('font-size','10px')
  .attr('alignment-baseline','hanging');

sunburstG.append('text')
  .attr('class','year-label')
  .attr('x', legendX + 14)
  .attr('y', barY + 120)
  .text(years[0])
  .style('font-size','10px')
  .attr('alignment-baseline','baseline');

      })
      .catch(err => console.error('Error loading sunburst_years:', err));
  }


function loadAllVisualizations() {
  loadBarChartByBorough();
  loadCombinedPieChart();
  
  loadSunburstYearChart();
  
  loadGeoMap();
  
}



let mapColorBy = 'Borough';
let mapSizeBy = 'Total Units';
let map = null;
let mapLegend = null;

function loadGeoMap() {
  
  const colorBySelect = document.getElementById('map-color-by');
  const sizeBySelect = document.getElementById('map-size-by');
  
  if (colorBySelect) mapColorBy = colorBySelect.value;
  if (sizeBySelect) mapSizeBy = sizeBySelect.value;
  
  
  let url = `${API_BASE_URL}/geo_data`;
  if (selectedYear) {
    url += `?year=${selectedYear}`;
  }
  
  fetch(url)
      .then(response => response.json())
      .then(data => {
          if (!Array.isArray(data)) throw new Error('Invalid geo data format');
          
        
          if (selectedBorough !== 'all') {
              data = data.filter(d => d.Borough === selectedBorough);
          }
          
          if (selectedConstructionType !== 'all') {
              data = data.filter(d => d['Construction Type'] === selectedConstructionType);
          }
          
    
          if (map) {
              map.remove();
          }
          
 
          const mapContainer = document.getElementById('geo-map');
          map = L.map(mapContainer, {
              zoomAnimation: false,
              markerZoomAnimation: false
          }).setView([40.7128, -74.0060], 11);
          
         
          let activeTooltip = null;
          
         
          map.on('click', function(e) {
           
              if (activeTooltip) {
                  activeTooltip.closeTooltip();
                  activeTooltip = null;
              }
              
            
              if (!e.originalEvent._stopped) {
                  map.closePopup();
              }
          });
          

          map.on('popupopen', function(e) {
              const popup = e.popup;
              const container = popup.getElement();
              
  
              L.DomEvent.disableClickPropagation(container);
              
 
              L.DomEvent.disableScrollPropagation(container);
          });
          

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          
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
          
         
          const maxValue = d3.max(data, d => +d[mapSizeBy] || 0);
          
         
          data.forEach(d => {
              
              let color;
              if (mapColorBy === 'Borough') {
                  color = boroughColors[d.Borough] || '#888888';
              } else if (mapColorBy === 'Construction Type') {
                  color = constructionColors[d['Construction Type']] || '#888888';
              }
              
              
              const value = +d[mapSizeBy] || 0;
              const radius = Math.sqrt(value / maxValue) * 20;
              
              const circle = L.circleMarker([d.Latitude, d.Longitude], {
                  radius: Math.max(radius, 1), 
                  fillColor: color,
                  color: '#fff',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8,
                  className: 'custom-marker',
                  bubblingMouseEvents: false, 
                  riseOnHover: false 
              }).addTo(map);
              
              
              const projectDate = d['Project Start Date'] || 'Unknown date';
              const projectYear = projectDate !== 'Unknown date' ? projectDate.split('/').pop() : 'Unknown year';
              
              
              const tooltipContent = `
                  <strong>${d['Project Name'] || 'Unnamed Project'}</strong><br>
                  ${d.Borough}<br>
                  ${d['Total Units']} units<br>
                  Year: ${projectYear}
              `;
              
              
              const popupContent = `
                  <div class="popup-content">
                      <h4>${d['Project Name'] || 'Unnamed Project'}</h4>
                      <p><strong>Borough:</strong> ${d.Borough}</p>
                      <p><strong>Total Units:</strong> ${d['Total Units']}</p>
                      <p><strong>Construction Type:</strong> ${d['Construction Type']}</p>
                    
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
              
            
              circle.bindTooltip(tooltipContent, {
                  direction: 'top',
                  offset: L.point(0, -radius -1), 
                  sticky: false, 
                  opacity: 0.9,
                  className: 'custom-tooltip',
                  permanent: false
              });
              
             
              circle.off('mouseover');
              circle.off('mouseout');
              
             
              circle.bindPopup(popupContent, {
                  maxWidth: 300,
                  className: 'custom-popup',
                  closeButton: true,
                  closeOnClick: false  
              });
              
              
              circle.on('click', function(e) {
        
                  L.DomEvent.stopPropagation(e);
                  
                  
                  if (activeTooltip && activeTooltip !== this) {
                      activeTooltip.closeTooltip();
                  }
                  
                  
                  if (activeTooltip === this) {
                      this.closeTooltip();
                      activeTooltip = null;
                  } else {
                      this.openTooltip();
                      activeTooltip = this;
                  }
                  
                
                  this.openPopup();
              });
          });
          
          
          addMapLegend(data);
          
          
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


function addMapLegend(data) {
    
    if (mapLegend) {
        map.removeControl(mapLegend);
    }
    
    mapLegend = L.control({position: 'bottomright'});
    
    mapLegend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        
     
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

function updateMapSettings() {
  const colorBySelect = document.getElementById('map-color-by');
  const sizeBySelect = document.getElementById('map-size-by');
  
  if (colorBySelect) mapColorBy = colorBySelect.value;
  if (sizeBySelect) mapSizeBy = sizeBySelect.value;
  
 
  loadGeoMap();
}


function loadSankeyPlot() {
    fetch('http://localhost:5001/sankey_data')
      .then(response => response.json())
      .then(data => {
        if (!data.nodes || !data.links) throw new Error('Invalid Sankey data format');
        
       
        const margin = {top: 30, right: 150, bottom: 20, left: 100};
        const width = document.getElementById('sankey-diagram').clientWidth - margin.left - margin.right;
        const height = document.getElementById('sankey-diagram').clientHeight - margin.top - margin.bottom;
        
        
        d3.select('#sankey-diagram').html('');
        
        
        const svg = d3.select('#sankey-diagram')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        
        
        const sankey = d3.sankey()
          .nodeWidth(25)
          .nodePadding(15)
          .extent([[1, 1], [width - 1, height - 5]]);
        
       
        const graph = sankey({
          nodes: data.nodes.map(d => Object.assign({}, d)),
          links: data.links.map(d => Object.assign({}, d))
        });
        
        
        const boroughs = data.nodes
          .filter(n => !n.name.includes('Units'))
          .map(n => n.name);
        
        const incomeCategories = data.nodes
          .filter(n => n.name.includes('Units'))
          .map(n => n.name);
    
        const boroughColors = {
            'Bronx':        '#ff7f0e',
            'Brooklyn':     '#1f77b4',
            'Manhattan':    '#2ca02c',
            'Queens':       '#d62728',
            'Staten Island':'#9467bd'
          };
        
        const incomeColors = {
          'Extremely Low Income Units': '#1E3A8A',
          'Very Low Income Units': '#1E40AF',
          'Low Income Units': '#2563EB',
          'Moderate Income Units': '#3B82F6',
          'Middle Income Units': '#60A5FA',
          'Other Income Units': '#93C5FD'
        };
        
const constructionColors = {
    'Preservation':     '#e377c2',  
    'New Construction': '#8c564b'   
  };
       

function getNodeColor(node) {
    if (boroughColors[node.name]) {
      return boroughColors[node.name];
    } else if (constructionColors[node.name]) {
      return constructionColors[node.name];
    } else if (incomeColors[node.name]) {
      return incomeColors[node.name];
    }
    return '#888888'; 
  }
        
        
        const defs = svg.append('defs');
        
        
        graph.links.forEach((link, i) => {
          const gradientId = `link-gradient-${i}`;
          const gradient = defs.append('linearGradient')
            .attr('id', gradientId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', link.source.x1)
            .attr('x2', link.target.x0);
          
         
          gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', getNodeColor(link.source))
            .attr('stop-opacity', 0.8);
          
          
          gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', getNodeColor(link.target))
            .attr('stop-opacity', 0.8);
        });
        
        
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
       
            d3.select(this)
              .style('stroke-opacity', 1)
              .attr('stroke-width', d => Math.max(1, d.width + 2));
            
            
            node.filter(n => n === d.source || n === d.target)
              .style('stroke', '#000')
              .style('stroke-width', 2);
            
            
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
        
            d3.select(this)
              .style('stroke-opacity', 0.7)
              .attr('stroke-width', d => Math.max(1, d.width));
            
           
            node.style('stroke', '#fff')
              .style('stroke-width', 1);
            
            
            d3.select("body").selectAll(".tooltip").remove();
          });
        
        const node = svg.append('g')
        .selectAll('.node')
        .data(graph.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${Math.round(d.x0)},${Math.round(d.y0)})`);

        
        
        node.append('rect')
          .attr('height', d => Math.max(d.y1 - d.y0, 10))
          .attr('width', d => d.x1 - d.x0)
          .attr('fill', d => getNodeColor(d))
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('rx', 4) 
          .attr('ry', 4)
          .style('filter', 'drop-shadow(0px 3px 3px rgba(0,0,0,0.2))')
          .on('mouseover', function(event, d) {
            
            link.style('stroke-opacity', l => 
              l.source === d || l.target === d ? 1 : 0.1
            );
            
            
            link.style('stroke-width', l => 
              l.source === d || l.target === d ? 
              Math.max(1, l.width + 2) : Math.max(1, l.width)
            );
            
            
            node.filter(n => n === d.source || n === d.target)
            .select('rect')
            .style('stroke', '#000')
            .style('stroke-width', 2);
            
            
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
            
            
            if (boroughColors[d.name]) {
              tooltipContent += '<br><br>Distribution:';
              d.sourceLinks.forEach(link => {
                tooltipContent += `<br>${link.target.name}: ${link.value.toLocaleString()} (${(link.value / d.value * 100).toFixed(1)}%)`;
              });
            } 
            
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
            
            link.style('stroke-opacity', 0.7)
                .attr('stroke-width', d => Math.max(1, d.width));
          
            
            node.select('rect')
                .style('stroke', '#fff')
                .style('stroke-width', 1);
          
           
            node.selectAll('text')
                .style('fill', '#0000')
                .style('opacity', 1);
        
                
            d3.select("body").selectAll(".tooltip").remove();
        
          
              
            
         
            d3.select(this)
              .style('stroke', '#fff')
              .style('stroke-width', 1);
              
          
            d3.select("body").selectAll(".tooltip").remove();
          });
        
     
        node.append('text')
          .attr('x', d => d.x0 < width / 2 ? -8 : d.x1 - d.x0 + 8)
          .attr('y', d => (d.y1 - d.y0) / 2)
          .attr('dy', '0.5em')
          .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
          .text(d => d.name)
          .style('font-size', '12px')
          .style('font-family', "'Poppins', sans-serif")
          .style('font-weight', 'normal')
          .style('pointer-events', 'none')
          .style('fill', '#333');
          
        
    
        node.append('text')
          .attr('x', d => d.x0 < width / 2 ? -8 : d.x1 - d.x0 + 8)
          .attr('y', d => (d.y1 - d.y0) / 2 + 14)
          .attr('dy', '0.35em')
          .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
          .text(d => `${d.value.toLocaleString()} units`)
          .style('font-size', '10px')
          .style('font-family', "'Poppins', sans-serif")
          .style('pointer-events', 'none')
          .style('fill', 'rgba(0,0,0,0.8)');
        
          
        
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


document.addEventListener('DOMContentLoaded', function() {
  loadSankeyPlot();
});


let brushedDimensions = {};

 
document.addEventListener('DOMContentLoaded', () => {
    
    loadParallelCoordinates();
  
    document.getElementById('reset-pcp').addEventListener('click', resetPCPBrushes);
});


function loadParallelCoordinates() {
    fetch(`${API_BASE_URL}/full_pcp_data`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
         
            const margin = {top: 50, right: 50, bottom: 50, left: 50};
            const width = 900 - margin.left - margin.right; 
            const height = 500 - margin.top - margin.bottom;
            
          
            d3.select('#pcp').html('');
            
         
            const svg = d3.select('#pcp')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
            
            
            const dimensions = data.dimensions;
            const categoricalDims = data.categorical_dims;
            const numericalDims = data.numerical_dims;
            
            
            let filteredData = data.items;
            if (selectedBorough !== 'all') {
                filteredData = filteredData.filter(d => d.Borough === selectedBorough);
            }
            if (selectedConstructionType !== 'all') {
                filteredData = filteredData.filter(d => d['Construction Type'] === selectedConstructionType);
            }
            
            
            const y = {};
            const x = d3.scalePoint()
                .range([0, width])
                .domain(dimensions);
            
            dimensions.forEach(dimension => {
                if (categoricalDims.includes(dimension)) {
                    const values = Array.from(new Set(filteredData.map(d => d[dimension])))
                        .filter(d => d != null);
                    y[dimension] = d3.scalePoint()
                        .domain(values)
                        .range([height, 0]);
                } else {
                    const values = filteredData.map(d => +d[dimension]).filter(d => !isNaN(d));
                    y[dimension] = d3.scaleLinear()
                        .domain([d3.min(values), d3.max(values)])
                        .range([height, 0]);
                }
            });
            
          
            const clusters = Array.from(new Set(filteredData.map(d => d.cluster)));
            const color = d3.scaleOrdinal(d3.schemeCategory10).domain(clusters);

            
            let dragging = {};
            function position(dim) {
            return dragging[dim] != null ? dragging[dim] : x(dim);
            }

            

            function path(d) {
                   return d3.line()(dimensions.map(dim => [
                    position(dim),
                    y[dim](d[dim])
                  ]));
                }
            

            const lines = svg.selectAll(".path-line")
                .data(filteredData)
                .enter().append("path")
                .attr("class", "path-line")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", d => color(d.cluster))
                .style("opacity", 0.7)
                .on("mouseover", function(event, d) {
                    d3.select(this).style("stroke-width","3px").style("opacity",1);
                    let content = `<strong>Cluster: ${d.cluster}</strong><br>`;
                    dimensions.forEach(dim => content += `${dim}: ${d[dim]}<br>`);
                    tooltip.style("display","block")
                           .html(content)
                           .style("left",(event.pageX+10)+"px")
                           .style("top",(event.pageY-20)+"px");
                })
                .on("mouseout", function() {
                    d3.select(this).style("stroke-width","1.5px").style("opacity",0.7);
                    tooltip.style("display","none");
                });
            
            

                const axes = svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", d => `translate(${position(d)})`)
                .call(d3.drag()
                .subject((event, d) => ({ x: position(d) }))
                .on("start", function(event, d) {
                    dragging[d] = position(d);
                })
                .on("drag", function(event, d) {
                    dragging[d] = Math.max(0, Math.min(width, event.x));
                    d3.select(this).attr("transform", `translate(${dragging[d]})`);
                    lines.attr("d", path);
                })
                .on("end", function(event, d) {
                    dimensions.sort((a, b) => position(a) - position(b));
                    x.domain(dimensions);
                    delete dragging[d];
    
                    svg.selectAll(".dimension")
                    .transition().duration(250)
                    .attr("transform", dd => `translate(${x(dd)})`);
          
                    lines.transition().duration(250)
                        .attr("d", path);
                })
                );

            
            axes.append("text")
                .attr("y",-10).attr("text-anchor","middle")
                .attr("fill","#333").style("font-size","12px")
                .text(d => d);
            
            axes.each(function(d) {
                d3.select(this).call(d3.axisLeft(y[d]));
            });
            
            axes.append("g")
                .attr("class","brush")
                .each(function(d) {
                    d3.select(this).call(
                        d3.brushY()
                          .extent([[-10,0],[10,height]])
                          .on("start", () => d3.event.sourceEvent.stopPropagation())
                          .on("brush end", brushed)
                    );
                });
            
            function brushed() {
                const actives = [];
                svg.selectAll(".brush")
                    .filter(function() { return d3.brushSelection(this) !== null; })
                    .each(function(d) {
                        actives.push({dimension: d, extent: d3.brushSelection(this)});
                    });
                if (!actives.length) {
                    lines.style("display", null);
                } else {
                    lines.style("display", d =>
                        actives.every(a => {
                            const val = y[a.dimension](d[a.dimension]);
                            return a.extent[0] <= val && val <= a.extent[1];
                        }) ? null : "none"
                    );
                }
            }
            
            
            const legendData = clusters.map(c => ({ label: `Cluster ${c}`, color: color(c) }));
            const legendContainer = d3.select('#pcp-legends').html('');
            const items = legendContainer.selectAll('.legend-item')
                .data(legendData)
                .enter().append('div')
                  .attr('class','legend-item');
            
            items.append('span')
                .attr('class','swatch')
                .style('background', d => d.color);
            
            items.append('span')
                .text(d => d.label);
        })
        .catch(error => {
            console.error('Error loading parallel coordinates:', error);
            d3.select('#pcp').html(`<div class="error-message">Error loading PCP data: ${error.message}</div>`);
        });
}
