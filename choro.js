$(document).ready( () => {

    let url3 = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
    let url4 = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

    let choro1 = choro(url3, {});
    let choro2 = choro(url4, {});

    let m = {top: 30, right: 30, bottom: 30, left: 30};
            let w = 500;
            let h = 500;

    // append the svg object to the body of the page
    let svg = d3.select("#demo")
        .append("svg")
        .attr("width", w )
        .attr("height", h );

    // Map and projection
    let path = d3.geoPath();
    let projection = d3.geoMercator()
    .scale(70)
    .center([0,20])
    .translate([w / 2, h / 2]);

    // Data and color scale
    let data = d3.map();
    let colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

    let url1 = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
    let url2 = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv";

    // Load external data and boot
    d3.queue()
    .defer(d3.json, url1)
    .defer(d3.csv, url2, (d) => { 
        
        data.set(d.code, +d.pop); 

    }).await(ready);

    function ready(error, topo) {

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath().projection(projection))
            // set the color of each country
            .attr("fill", (d) => {
                
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
                
            });

    }

    $.ajax({
        url: url1, 
        success: (response) => {

            let dataset = JSON.parse(response);
            console.log(dataset);

        },
        error: (xhr, ajaxOptions, thrownError) => {

            console.log(xhr, ajaxOptions, thrownError);
            
        }
        
    });

});

async function choro(url = '', data = {}) {
	  
    let result = await fetch(url)
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => {
          console.error('Error:', error);
    }); 
    
    return result;

}
