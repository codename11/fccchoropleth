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

  d3.queue()
      .defer(d3.json, url2)
      .defer(d3.json, url1)
      .await(ready);//callback bellow.

  function ready(error, us, education){

    if(error){
      throw error;
    }
    
    //barebones, simplified. using topojson extension.
    svg.selectAll("path")  // should be familiar, adding "path" for all data points, like adding 'rect'
      .data(topojson.feature(us, us.objects.counties).features) // here you convert topojson data to geojson data. I have no idea how the math works. Topojson is like a 'compressed' version of geojson
      .enter()
      .append("path")
      .attr("d", path);

  }

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

//choro(url1, {});//education
//choro(url2, {});//counties