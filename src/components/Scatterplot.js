import * as d3 from 'd3';
import * as $ from 'jquery';

import Graph from '../utils/Graph';
import { graph } from '../tools/Algorithms';

export default class Scatterplot {

    static CreateScatterplot(data) {

        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scaleLinear()
            .range([0, width]);
        var y = d3.scaleLinear()
            .range([height, 0]);

        var grid = g => g
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .call(g => g.append("g")
                .selectAll("line")
                .data(x.ticks())
                .join("line")
                .attr("x1", d => 0.5 + x(d) + margin.left)
                .attr("x2", d => 0.5 + x(d) + margin.left)
                .attr("y1", 0)
                .attr("y2", height))
            .call(g => g.append("g")
                .selectAll("line")
                .data(y.ticks())
                .join("line")
                .attr("y1", d => 0.5 + y(d))
                .attr("y2", d => 0.5 + y(d))
                .attr("x1", margin.left)
                .attr("x2", width + margin.left));

        // Compute the scales’ domains.
        var dim1 = Object.keys(data[0])[0];
        var dim2 = Object.keys(data[0])[1];

        x.domain(d3.extent(data, function (d) { return parseFloat(d[dim1]); }));
        y.domain(d3.extent(data, function (d) { return parseFloat(d[dim2]); }));

        const svg = d3.create("svg")
            .attr("viewBox", [0, -50, width+150, height+150]);

        svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add the x-axis.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + (height) + ")")
            .call(d3.axisBottom(x));

        // Add the y-axis.
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y));

        // Add grid
        svg.append("g")
            .call(grid);

        //add range of colours
        var myColor = d3.scaleOrdinal().domain(data)
            .range(d3.schemeCategory10 );

        // create a tooltip
        var tooltip = d3.select("#scatter-vis")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-radius", "5px")
            .style("padding", "10px");

        var mouseover = function (d, i) {
            var html_string =
                "Class: " + d["class"] +
                "<br/>" +
                "Index: " + (i) +
                "<br/>" +
                "Datapoint: (" + parseFloat(d[dim1]).toFixed(2) + " , " + parseFloat(d[dim2]).toFixed(2) + ")" +
                "<br/>" + 
                "Position: (" + parseFloat($(this).attr('cx')).toFixed(2) + ", " + parseFloat($(this).attr('cy')).toFixed(2) + ")";

            try {
                let degree = graph.getDegree(i);
                html_string += "<br/>" + "Degree: " + degree;
            } catch (e) {}

            return tooltip
                .html(html_string)
                .style("left", (x(d[dim1]) + margin.left + 300) + "px")
                .style("top", (y(d[dim2]) + margin.top + 80) + "px")
                .style("visibility", "visible");
        }

        // Add the points!

        svg.selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return (x(d[dim1]) + margin.left); })
            .attr("cy", function (d) { return (y(d[dim2])); })
            .attr("r", 4.5)
            .attr("fill", function (d) { return myColor(d.class) })
            .style('cursor', 'pointer')
            .on("mouseover", mouseover)
            .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

        return svg.node();

    }
}
