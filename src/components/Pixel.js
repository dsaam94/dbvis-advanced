import * as d3 from 'd3';
import { svg } from 'd3';
import * as $ from 'jquery';
import * as helpers from '../tools/helpers';
import Hilbert from '../tools/hilbert';

export default class Pixel {

    create(data, name) {

        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 1030 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var size = width/4;   
         
        //create svgs in seperate divs
        const mainDiv = d3.select("#pixel-vis")
                        .append("div")
                        .attr('id', 'svgs');


        var columns = Object.keys(data[0]).filter(d => d !== 'class');
        if(name != undefined){
            data.sort(function(x,y){ return (x[name] - y[name])})
        }
        
        columns.forEach((column) => {

                var columnData = data.map(function(d){ return d[column]; })
                var x =  d3.scaleLinear()
                        .range([0, width])
                        .domain(d3.extent(columnData, function (d) { return parseFloat(d[column]); }));
                var color = d3.scaleLinear()
                            .domain(d3.extent(columnData, function (d) { return parseFloat(d); }))
                            .range(["#a8ff60", "#0600cc"])
                            .interpolate(d3.interpolateHcl);
                var tooltip = d3.select("#pixel-vis")
                            .append("div")
                            .style("position", "absolute")
                            .style("visibility", "hidden")
                            .style("background-color", "white")
                            .style("border", "solid")
                            .style("border-radius", "5px")
                            .style("padding", "10px");            
                const svg = mainDiv.append("svg")
                            .attr("width", size)
                            .attr("height", size)
                            .style("display", "inline"); 

            
                columnData.forEach(function(row,i){
                    var point = Hilbert.d2xy(Math.pow(2, 6),i);
                    var mouseover = function(d,i){
                        var html_string = parseFloat(row[i]);
                        return tooltip
                                .html(html_string)
                                .style("left", (x(row[i]) + margin.left) + "px")
                                //.style("top", (y(d[dim2]) + margin.top + 80) + "px")
                                .style("visibility", "visible"); 
                    }
                    svg.append('rect')
                        .attr("x", 30 + (point[0]*20/2)) //setting pixel width to 20
                        .attr("y", 50 + (point[1]*20/2))
                        .attr("width", 20/2)
                        .attr("height", 20/2)
                        .attr("fill", color(row))
                        .on("mouseover", mouseover)
                        .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });;
                });

                svg.on("click", function(){
                    var pixel = new Pixel();
                    $("#pixel-vis").find("div").remove();
                    pixel.create(data,column);
                });

                svg
                .append("text")
                .text(column)
                .attr('x', 20)
                .attr('y', 40);

        });


    }

}