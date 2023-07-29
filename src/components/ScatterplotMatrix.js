import * as d3 from 'd3';
import * as $ from 'jquery';
// import Scatterplot from './Scatterplot';
import Algorithms from '../tools/Algorithms';

export default class ScatterplotMatrix {

    constructor() {
        this.margin = { top: 15, right: 20, bottom: 20, left: 25 };
        this.width = 950 - this.margin.left - this.margin.right;
        this.height = 950 - this.margin.top - this.margin.bottom;
        this.div = [];
        this.svg = [];
        this.scatters = []; //empty list for later access
        this.measures = [];
        this.scatterWidth = 0;
        this.scatterHeight = 0;
        this.n = 0;
    }

    //reinitializes svg div
    clearSVG() {
        d3.select("#splom-vis").select("div").remove();
        this.div = d3.select("#splom-vis").node();

        d3.select("#slider-div").style("opacity", 0);

        const new_div = d3.create("div")
            .style("width", this.width + "px")
            .style("height", this.height + "px")
            .style("display", "block");

        this.div.append(new_div.node());
        this.svg = d3.select("#splom-vis div");
        this.scatters = []; //empty list for later access
        this.scatterWidth = 0;
        this.scatterHeight = 0;
    }

    //creates scatterplot groups depending on dimension of dataset
    init(n) {
        this.n = 0;

        let ind_width = Math.floor((this.width - 5 * 2 * n) / n);
        let ind_height = Math.floor((this.height - 5 * 2 * n) / n);

        this.scatterWidth = ind_width;
        this.scatterHeight = ind_height;

        [...Array(n * n)].map((_, i) => i).forEach(element => {

            let row = Math.floor(element / n);
            let col = Math.floor(element % n);

            let new_scatter = this.svg.append("g")
                .attr("id", "scatterplot-" + row + "-" + col)
                .style("width", ind_width + "px")
                .style("height", ind_height + "px")
                .style("display", "inline-block")

            this.scatters.push(new_scatter.node());
        });
    }

    create(data) {
        let columns = data.columns;

        //remove class as it is not a dimension
        try {
            const index = columns.indexOf("class");
            if (index > -1) {
                columns.splice(index, 1);
            }
        } catch (e) { }

        let n = columns.length;

        //initialize groups
        this.init(n);

        for (var i = 0; i < n; i++) {       //matrix rows
            for (var j = 0; j < n; j++) {   //matrix cols
                var dim1 = columns[i];
                var dim2 = columns[j];

                let scatter = this.scatter(data, dim1, dim2);

                //console.log(scatter);

                let current_group = this.scatters[i * n + j];
                current_group.append(scatter);        

                //calculate outlying measures
                let measure = this.MST("#scatterplot-" + i + "-" + j);
                this.measures.push(measure);
            }
        }

        d3.select("#slider-div").style("opacity", 1);

        //slider initialization
        let slider = d3.select("#slider")
            .attr("min", 0)
            .attr("max", d3.max(this.measures)*1.1)
            .attr("step", 0.001)
            .attr("value", d3.max(this.measures) / 2)
            .node();

        let slidertext = d3.select("#slider-text").node();

        let measures = this.measures;
        let scatters = this.scatters;

        slider.oninput = function () {
            let localSlider = this;
            slidertext.innerHTML = "Outlying Measure: " + this.value;
            measures.forEach(function (d, i) {
                if (d < localSlider.value) {
                    scatters[i].style.opacity = "0.2";
                } else {
                    scatters[i].style.opacity = "1";
                }
            });
        }
    }

    //create scatterplot with dimenstions dim1 dim2
    scatter(data, dim1, dim2) {
        //Scale initialization
        var x = d3.scaleLinear()
            .range([0, this.scatterWidth - this.margin.left - this.margin.right]);
        var y = d3.scaleLinear()
            .range([this.scatterHeight - this.margin.bottom - this.margin.top, 0]);

        x.domain(d3.extent(data, function (d) { return parseFloat(d[dim1]); }));
        y.domain(d3.extent(data, function (d) { return parseFloat(d[dim2]); }));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, this.scatterWidth, this.scatterHeight]);

        // Add the x-axis.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + this.margin.left + "," + (this.scatterHeight - this.margin.bottom) + ")")
            .call(d3.axisBottom(x));

        // Add the y-axis.
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .call(d3.axisLeft(y));

        //add range of colours
        var myColor = d3.scaleOrdinal().domain(data)
            .range(d3.schemeCategory10);

        // Add the points!

        let margin_left = this.margin.left;
        let margin_top = this.margin.top;

        svg.selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return parseFloat(x(d[dim1]) + margin_left).toFixed(2) ; })
            .attr("cy", function (d) { return parseFloat(y(d[dim2]) + margin_top).toFixed(2); })
            .attr("r", 2)
            .attr("fill", function (d) { return myColor(d.class) })

        return svg.node();
    }

    //calculate outliers and measure for the id svg
    MST(id) {
        var positions = [];
        
        try {
            let checked = Boolean($(".checkbox-splom input").prop("checked"));

            d3.select(id).selectAll("circle")
                .each(function (d, i) {
                    var x_val = parseFloat(this.getAttribute("cx")).toFixed(2);
                    var y_val = parseFloat(this.getAttribute("cy")).toFixed(2);

                    positions.push([x_val, y_val]);
                });

            return Algorithms.MST(positions, id, 6, checked);

        } catch (e) {
        }
    }
}
