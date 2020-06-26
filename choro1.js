let  url1 = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
let url2 = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

$(document).ready( () => {

  let m = {top: 30, right: 30, bottom: 30, left: 30};
  let w = 960;
  let h = 600;

  let svg = d3.select("#demo")
                .append("svg")
                .attr("width", w + m.left*2)
                .attr("height", h + m.top*2);

  let path = d3.geoPath();

  let x = d3.scaleLinear()
      .domain([2.6, 75.1])
      .rangeRound([600, 860]);

  let color = d3.scaleThreshold()
      .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
      .range(d3.schemeOranges[9]);

  let g = svg.append("g")
      .attr("class", "key")
      .attr("id", "legend")
      .attr("transform", "translate(-560,630)");

  let tooltip = d3.select('#demo')
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);
    
  g.selectAll("rect")
    .data(color.range().map((d) => {

        d = color.invertExtent(d);
        
        if(d[0] == null){
          d[0] = x.domain()[0];
        }

        if(d[1] == null){
          d[1] = x.domain()[1]
        }

        return d;

    }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", (d) => { 
        
        return x(d[0]); 

      })
      .attr("width", (d) => { 
        
        return x(d[1]) - x(d[0]); 

      })
      .attr("fill", (d) => { 
        return color(d[0]); 
      });

  g.append("text")
      .attr("class", "naslov")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "400")

  g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickFormat((x) => { 

        return Math.round(x) + "%";

      })
      .tickValues(color.domain()))
      .select(".domain")
      .remove();

  d3.queue()
      .defer(d3.json, url2)
      .defer(d3.json, url1)
      .await(callback);//callback function bellow.

  function callback(error, countryData, eduData){

    //Error sent to callback for handling.
    if(error){
      throw error;
    }
    
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")//How topojson extract needed coordinates from this dataset god knows.
        .data(topojson.feature(countryData, countryData.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("data-fips", (d) => {

          return d.id;

        })
        .attr("data-education", (d) => {
          
          let result = eduData.filter(( obj ) => {
            return obj.fips == d.id;
          });

          if(result[0]){
            return result[0].bachelorsOrHigher;
          }
          
          console.log("Error. No data for: ", d.id);
          return 0;

        })
        .attr("fill", (d) => { 
          
          let result = eduData.filter(( obj ) => {
            return obj.fips == d.id;
          });

          if(result[0]){
            
            return color(result[0].bachelorsOrHigher);

          }
          
          return color(0);

        })
        .attr("d", path).on("mouseover", (d) => {   
          
          tooltip.style("opacity", 0.7); 
          tooltip.html(() => {

            let  res = eduData.filter(( obj ) => {

              return obj.fips == d.id;

            });

            if(res[0]){

              return res[0]["area_name"] +", " + res[0]["state"] + ": " + res[0].bachelorsOrHigher + "%";
            
            }
            
            return 0;

        })
        .attr("data-education", () => {

          let res = eduData.filter(( obj ) => {

            return obj.fips == d.id;

          });

          if(res[0]){

            return res[0].bachelorsOrHigher;

          }
          
          return 0;

        })
        .style("left", (d3.event.pageX + 10) + "px") 
        .style("top", (d3.event.pageY - 28) + "px"); }) 
        .on("mouseout", (d) => { 

          tooltip.style("opacity", 0); 

        });

    svg.append("path")
        .datum(topojson.mesh(countryData, countryData.objects.states, (a, b) => { 
          return a !== b; 
        }))
        .attr("class", "states")
        .attr("d", path);

  }

});