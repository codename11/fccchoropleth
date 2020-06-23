$(document).ready( () => {

    let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    $.ajax({
        url: url, 
        success: (response) => {

            let dataset = JSON.parse(response);
            let baseTemp = dataset.baseTemperature;

            // set the dimensions and margins of the graph
            let m = {top: 30, right: 30, bottom: 30, left: 30};
            let w = 800;
            let h = 600;

            // append the svg object to the body of the page
            let svg = d3.select("#demo")
                .append("svg")
                .attr("width", w + m.left*2)
                .attr("height", h + m.top + m.bottom*5);

            //Translating axises to accomodate for margin.If we don't, ticks and numbers would look cut of.
            const g = svg.append("g").attr("transform", "translate(" + m.left*2 + ","+m.top*3+")");
            
            let years = dataset.monthlyVariance.map((item, i) => {
                return item.year;
            });

            let date = dataset.monthlyVariance.map((item, i) => {
                return new Date(item.year, item.month-1).getFullYear();
            });
            
            let yearsNoDuplicates = years.filter((item, i) => {
                return years.indexOf(item) === i;
            })

            //Calculating year.
            let minYear = new Date(d3.min(date));//Calculating first year in dataset.
            let maxYear = new Date(d3.max(date));//Calculating last year in dataset.

            // Build X scales and axis:
            let x = d3.scaleBand()
                .range([ 0, w ])
                .domain(yearsNoDuplicates);

            /*
            Same result.
            console.log(x.domain());
            console.log(yearsNoDuplicates);
            */
            //Drawing y axis.
            const xAxis = d3.axisBottom(x).tickValues(x.domain().filter((d,i) => { 
                return d%10===0;
            }));
            
            //Appending x axis to chart.
            g.append("g")
                .attr("transform", "translate(0," + h + ")")
                .attr("class", "tick axis")
                .attr("id", "x-axis")
                .call(xAxis);

            let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let y = d3.scaleBand()
                .range([0, h])//Actual y axis length.
                .domain(monthNames);//Setting values from zero to max value on y axis.
            
            let yAxis = d3.axisLeft(y);

            g.append("g")
                .attr("transform", "translate(0, 0)")
                .attr("id", "y-axis")
                .call(yAxis);

            let rectWidth = (w-m.left-m.right) / dataset.monthlyVariance.length;
            let rectHeight = h / 12;

            let temps = dataset.monthlyVariance.map((item, i) => {
                return item.variance;
            });
            let minTemp = d3.min(temps)+baseTemp;
            let maxTemp = d3.max(temps)+baseTemp;
            let colors = d3.scaleLinear()
                .range(["yellow", "red", "purple", "navy"])
                .domain([minTemp, maxTemp]);
            
            //Creating tooltip element.
            const tooltip = d3.select('#demo')
                .append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0);

            //Creating bar/s.
            g.selectAll("rect")
                .data(dataset.monthlyVariance)
                .enter()
                .append("rect")
                .attr("x", (d,i) => {
                    return x(date[i])+1;
                })
                .attr("y", (d,i) => { 
                    return  y(monthNames[d.month-1]);
                })
                .attr("width", (d, i) =>{
                    
                    return rectWidth*12;
                })
                .attr("height", (d, i) =>{
                    return rectHeight;
                })
                .attr("data-year", (d,i) => {
                    return d.year;
                })
                .attr("data-month", (d,i) => {
                    
                    return d.month-1;
                })
                .attr("data-temp", (d,i) => {
                    
                    return baseTemp+d.variance;
                })
                .attr("class", "cell")
                .style('fill', (d, i) => {
                    return colors(d.variance+baseTemp);
                })
                .on('mouseover', (d, i) => {
                    tooltip.style('opacity', 1);
                    tooltip.html("<div style='margin-bottom: 5px;'>Year: "+d.year+" Month: "+d.month+" variance: "+d.variance+"</div>");
                    tooltip.attr('data-year', d.year);
                    tooltip.attr("left", "50");
                    tooltip.attr("top", "10");
                })
                .on('mouseout', (d) => {
                    tooltip.style('opacity', 0);
                });

                //Draw the Heat Label:
                svg.append("text")
                    .attr("id", "title")
                    .attr("class", "headline")
                    .attr("x", w / 2)
                    .attr("y", m.top)
                    .attr("font-family", "sans-serif")
                    .attr("fill", "green")
                    .attr("text-anchor", "middle")
                    .text("Monthly Global Land-Surface Temperature"); 

                //Draw the Heat Sub-Label:
                svg.append("text")
                    .attr("id", "description")
                    .attr("class", "headline1")
                    .attr("x", w / 2)
                    .attr("y", m.top*2)
                    .attr("font-family", "sans-serif")
                    .attr("fill", "green")
                    .attr("text-anchor", "middle")
                    .text(minYear.getFullYear()+" - "+maxYear.getFullYear()+": base temperature "+baseTemp+"°C");
                    
                //Creating legend element.
                const legend = svg.append('g')
                    .attr('id', 'legend')
                    .attr("transform", "translate("+m.left*2+", 0)");

                legend.selectAll("rect")
                    .data(colors.range())
                    .enter()
                    .append("rect")
                    .attr("class", "animated bounceInLeft")
                    .attr("x", (d, i) => {
                        return ((m.left+2)*i);
                    })
                    .attr("y", h+m.top*4)
                    .attr("width", m.left)
                    .attr("height", m.left)
                    .attr("fill", (d, i) => {
                        return d;
                    });

                let cls = ["navy",  "purple", "red", "yellow"];
                legend.selectAll('text')
                    .data(colors.range().map((item, i) => {
                        return i;
                    }))
                    .enter()
                    .append('text')
                    .attr("class", "animated bounce")
                    .attr('x', function(d,i){
                      return ((m.left+2)*i)+m.left/3;
                    })
                    .attr('y', (h+m.top*4)+m.top/1.4)
                    .text((d,i) => {

                        return i;

                    })
                    .style('fill', (d, i) => {

                        return cls[i];
                        
                    })
                    .style('stroke', 'none');

        },
        error: (xhr, ajaxOptions, thrownError) => {

            console.log(xhr, ajaxOptions, thrownError);
            
        }
        
    });

    
    document.addEventListener("mouseover", (e) => {

        if(e.target.className.baseVal === "cell"){
            
            document.getElementById("tooltip").style.left = e.clientX - 120;
            document.getElementById("tooltip").style.top = e.clientY - 80;
            
        }
        
    });

});