import * as d3 from 'd3';
import * as helpers from '../tools/helpers';
import * as $ from 'jquery';

export { alpha };
export { beta };
var alpha = 0;
var beta = 0;

export default class ParallelCoordinatePlot {

    constructor() {

        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.width = 1360 - this.margin.left - this.margin.right;
        this.height = 800 - this.margin.top - this.margin.bottom;
        this.div = [];
        this.svg = [];
        this.n = 0;
    }

    changeAlpha(value) {
        alpha = value;
    }

    changeBeta(value) {
        beta = value;
    }

    createPCP(data) {
        d3.select("#slider-div-pcp").style("opacity", 1);

        //data processing for cluster preparation
        var classes = data.map(x => x["class"]).filter(function (d, i, self) { return self.indexOf(d) === i}); //returns class ids

        var classesData = []; //stores data for each class for later clustering

        classes.forEach(function (d) {
            classesData.push(data.filter(x => x["class"] == d));
        })

        //PCP variables
        var dimensions = Object.keys(data[0]).filter(function (d) { return d != "class" });

        var y = {}
        for (var i in dimensions) {
            name = dimensions[i]
            y[name] = d3.scaleLinear()
                .domain(d3.extent(data, function (d) { return +d[name]; }))
                .range([this.height, 0])
        }

        var x = d3.scalePoint()
            .range([0, this.width])
            .padding(1)
            .domain(dimensions);

        var centroids = this.calculateCentroids(classesData, dimensions, y);

        var thisObject = this;

        // BEZIER line function
        function path(d) {

            return thisObject.createBezier(d, dimensions, x, y, centroids, classes);

        }

        var myColor = d3.scaleOrdinal().domain(data)
            .range(d3.schemeCategory10);

        const svg = d3.create("svg")
            .attr("viewBox", [0, -50, this.width + 150, this.height + 150]);

        svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        svg
            .selectAll("Path")
            .data(data)
            .enter().append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", function (d) { return myColor(d.class) })
            .style("opacity", 0.5)

        // Draw the axis:
        svg.selectAll("Axes")
            // add a g element for each dimension of the datset selected
            .data(dimensions).enter()
            .append("g")
            //translate the element to be positioned at right of the x-axis
            .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
            //append other dimension axes towards its left, till the end
            .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            // add title to each axis
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) { return d; })
            .style("fill", "black")

        return svg.node();
    }

    createBezier(d, dimensions, x, y, centroids, classes) {
        //console.log(d);

        //calculate total dist
        var totalDist = (helpers.round(x(dimensions[1])) - helpers.round(x(dimensions[0]))) / 4; 

        var html = [];
        var prevQ;
        var nextQ;

        //creates path string
        for (var i = 0; i < dimensions.length - 1; i++) {
            var i0 = [];
            var i1 = dimensions[i];
            var i2 = [];
            var i3 = [];

            /*-------------- VARIABLES FOR GETTING CORRESPONDING POINTS ------------------*/
            //checks if its first dimension
            i0 = dimensions[i - 1] == undefined ? dimensions[i] : dimensions[i-1];

            //checks for next point
            try {
                i2 = dimensions[i + 1];
            } catch (e) {
                i2 = dimensions[i];
            }

            //checks for last dimension
            i3 = dimensions[i + 2] == undefined ? dimensions[i + 1] : dimensions[i + 2];

        /*--------------------------------- NECESSARY POINTS ------------------------------------------*/  
            //var prevPoint = [helpers.round(x(i0)), helpers.round(y[i0](d[i0]))];    
            var firstPoint = [helpers.round(x(i1)), helpers.round(y[i1](d[i1]))];
            var lastPoint = [helpers.round(x(i2)), helpers.round(y[i2](d[i2]))];
            //var nextPoint = [helpers.round(x(i3)), helpers.round(y[i3](d[i3]))];
            //if (i0 == i1) prevPoint[0] -= 1; //to calculate slope correctly
            //if (i3 == i2) nextPoint[0] += 1; //to calculate slope correctly

            //calculating Qi-1
            var prevPoint = prevQ == undefined ? [firstPoint[0] - totalDist * 2, firstPoint[1]] : prevQ;

            //calculating Qi+1
            var nextPoint = [];
            if (dimensions[i + 2] != undefined) {
                i3 = dimensions[i + 2];
                nextPoint = [helpers.round(x(i3)), helpers.round(y[i3](d[i3]))];

                var midPoint = [(lastPoint[0] + nextPoint[0]) / 2, (lastPoint[1] + nextPoint[1]) / 2];
                var centroid = centroids[i + 1][classes.indexOf(d["class"])];
                var pulledPoint = [midPoint[0], helpers.round((1 - beta) * midPoint[1] + beta * centroid)];
                nextPoint = pulledPoint;
            } else {
                nextPoint = [lastPoint[0] + totalDist * 2, lastPoint[1]];
            }  

            //calculating Qi'
            var midPoint = [];
            var centroid = [];
            var pulledPoint = [];

            midPoint = [(firstPoint[0] + lastPoint[0]) / 2, (firstPoint[1] + lastPoint[1]) / 2];
            if (i == 0) {
                centroid = centroids[i][classes.indexOf(d["class"])];
                pulledPoint = [midPoint[0], helpers.round((1 - beta) * midPoint[1] + beta * centroid)];
            } else {
                pulledPoint = nextQ;
            }

            /*
            console.log(prevPoint);
            console.log(firstPoint);
            console.log(midPoint);
            console.log(pulledPoint);
            console.log(lastPoint);
            console.log(nextPoint);
            */
                      
            //calculate control points
            var controlsFirst = this.calculatePoints(firstPoint, this.changeIntersect(this.calculateLine(prevPoint, pulledPoint), firstPoint), totalDist);
            var controlsMid = this.calculatePoints(pulledPoint, this.changeIntersect(this.calculateLine(firstPoint, lastPoint), pulledPoint), totalDist); //change midPoint for pulledPoint
            var controlsLast = this.calculatePoints(lastPoint, this.changeIntersect(this.calculateLine(pulledPoint, nextPoint), lastPoint), totalDist);


            /*-------------- HTML STRING CREATION FOR PATH ------------------*/
            //insert first point
            html += "M";
            html += firstPoint[0] + "," + firstPoint[1] + "\n";

            //first two control points
            html += "C";
            html += controlsFirst[1][0] + "," + controlsFirst[1][1] + "\n";
            html += controlsMid[0][0] + "," + controlsMid[0][1] + "\n";

            //insert middle point
            html += pulledPoint[0] + "," + pulledPoint[1] + "\n";
            html += "M";
            html += pulledPoint[0] + "," + pulledPoint[1] + "\n";

            //second two control points
            html += "C";
            html += controlsMid[1][0] + "," + controlsMid[1][1] + "\n";
            html += controlsLast[0][0] + "," + controlsLast[0][1] + "\n";

            //insert last point
            html += lastPoint[0] + "," + lastPoint[1] + "\n\n";

            prevQ = midPoint;  
            nextQ = nextPoint;
        }

        //console.log(html);
        return html;
    }

    //calculates points at alpha distance of point with lineInfo line
    calculatePoints(point1, lineInfo, totalDist, print) {
        if (print) {
            console.log(point1);
            console.log(lineInfo);
        }

        var left = [
            helpers.round(point1[0] - alpha * totalDist),
            helpers.round(lineInfo[0] * (point1[0] - alpha * totalDist) + lineInfo[1])
        ];
        var right = [
            helpers.round(point1[0] + alpha * totalDist),
            helpers.round(lineInfo[0] * (point1[0] + alpha * totalDist) + lineInfo[1])
        ];

        if (print) {
            console.log(left);
            console.log(right);
        }

        return [left, right];
    }

    //calculates slope and intercept of the line that goest through two points
    calculateLine(point1, point2) {
        var slope = (point2[1] - point1[1]) / (point2[0] - point1[0]);
        var intercept = point1[1] - point1[0] * slope;
        return [slope, intercept];
    }

    //changes intersect for new point
    changeIntersect(lineInfo, point) {
        var intercept = point[1] - point[0] * lineInfo[0];
        return [lineInfo[0], intercept];
    }

    //calculates centroids
    calculateCentroids(data, dimensions, y) {
        //centroid saving array initialization
        var centroids = new Array();
        for (var i = 0; i < dimensions.length; i++) {
            centroids.push(new Array());
        }

        //calculate centroids per class
        data.forEach(function (classData, i) { //foreach class
            var dimData = [];
            dimensions.forEach(function (d) {
                dimData.push(new Array());
            });

            //calculate centroids (median) of each dimension
            classData.forEach(function (d) {
                dimensions.forEach(function (dim, i) {
                    dimData[i].push(helpers.round(y[dim](d[dim])));
                });
            });
            //console.log(dimData);
            var dimMedians = dimData.map(x => d3.median(x));

            //calculate midpoint in dimension centroids and add to centroids[dim][class]
            dimMedians.forEach(function (d, i, elements) {
                centroids[i].push((d + elements[i+1]) / 2);
            });
        });

        centroids.pop(); //since we are doing pairwise sum we get n-1 positions so need to remove last NaN
        //console.log(centroids);

        return centroids;
    }
}
