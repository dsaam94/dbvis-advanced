import * as $ from 'jquery';
import * as d3 from 'd3';

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

/**
 * Checks, if values in a list of numbers are already sorted.
 */
function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (+arr[i - 1] > +arr[i]) {
            return false;
        }
    }

    return true;
}

/**
 * See: https://stackoverflow.com/a/11180172
 *
 * there appears to be a discrepancy with the way jQuery and d3 handle events
 * that causes a jQuery induced click event $("#some-d3-element").click() to
 * not dispatch to the d3 element.
 * A workaround:
 */
export function registerJQueryD3Click() {
    $.fn.d3Click = function () {
        this.each((i, e) => {
            const evt = new MouseEvent('click');
            e.dispatchEvent(evt);
        });
    };
}

/**
 * Returns the value in arr which is the n-th percentile.
 * See: https://en.wikipedia.org/w/index.php?title=Percentile&oldid=882969901
 */
export function percentile(n, arr) {
    let arr_sorted = arr;

    if (!isSorted(arr)) {
        arr_sorted = arr.sort((v1, v2) => v1 - v2);
    }

    const q_index = Math.ceil((n / 100) * arr_sorted.length) - 1;
    return arr_sorted[q_index];
}

/**
 * Checks if two arrays are equal, i.e.
 *  - have equal length
 *  - and contain the same elements
 */
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Takes a 2D-array as argument and returns the transposed array.
 */
export function arrayTranspose(array) {
    const dim0length = array.length;
    const dim1length = array.reduce((acc, curr) => Math.min(acc, curr.length), array[0].length);

    const newArray = [];
    for (let i = 0; i < dim1length; i++) {
        newArray.push([]);
    }

    for (let i = 0; i < dim0length; i++) {
        for (let j = 0; j < dim1length; j++) {
            newArray[j].push(array[i][j]);
        }
    }

    return newArray;
}

/**
 * Compute euclidean distance of two vectors, stored as arrays.
 */
export function euclideanDistance(vec1, vec2) {
    const minDim = Math.min(vec1.length, vec2.length);

    let summedSquares = 0;
    for (let i = 0; i < minDim; i++) {
        summedSquares += ((vec1[i] - vec2[i]) * (vec1[i] - vec2[i]));
    }

    return Math.sqrt(summedSquares);
}

/**
 * Clamp value to interval [min, max]
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Returns rounded float to 2 decimals
 */
export function round(value) {
    return parseFloat(parseFloat(value).toFixed(2));
}

/**
 * Creates an array of size n x n
 */
export function makeArray(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(Array(n));
    }
    return arr;
}

/**
 * Returns the euclidean distance matrix for input data points
 */
export function distMatrix(data) {
    var n = data.length;
    var dims = data.columns.filter(x => x != "class");
    var distArray = makeArray(n);

    //each node
    for (var i = 0; i < n; i++) {

        //each neighbour
        for (var j = 0; j < n; j++) {

            //only if dist is not already calculated
            if (distArray[i][j] == undefined) {

                var distSum = 0;

                //euclidean distance
                dims.forEach(function (d) {
                    distSum += Math.pow((data[j][d] - data[i][d]), 2); //squared dimension distance
                });

                //square root of dimension distance sum
                distSum = Math.sqrt(distSum);

                //distances are the same from both points (saves calculation time)
                distArray[i][j] = distSum;
                distArray[j][i] = distSum;
            }
        }
    }

    return distArray;
}

/*
* Draws the scatterplot for the corresponding points
*/
export function plot2D(points, classes) {
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
        .range([0, width]);
    var y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(d3.extent(points, function (d) { return d[0]; }));
    y.domain(d3.extent(points, function (d) { return d[1]; }));

    const svg = d3.create("svg")
        .attr("viewBox", [0, -50, width + 150, height + 150]);

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

    //add range of colours
    var myColor = d3.scaleOrdinal().domain(classes)
        .range(d3.schemeCategory10);

    // Add the points!
    svg.selectAll(".point")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return (x(d[0]) + margin.left); })
        .attr("cy", function (d) { return (y(d[1])); })
        .attr("r", 4.5)
        .attr("fill", function (d, i) { return myColor(classes[i]); })

    return svg.node();
}