import * as d3 from 'd3';
import * as $ from 'jquery';
import TSNE from 'tsne-js';
import * as helpers from '../tools/helpers';

export default class TSNEplotter {
    constructor() { }

    /*
     * Calculates and shows TSNE distribution
     */
    create(data) {
        var points = this.drawTSNE(data);

        console.log(points);
        //return;

        return helpers.plot2D(points, data.map(x => x["class"]));
    }

    drawTSNE(data) {
        var dimensions = Object.keys(data[0]).filter(function (d) { return d != "class" });

        //filter class column for data object
        var filtered = [];

        //filter the class column
        data.forEach((row) => {
            var temp = [];
            dimensions.forEach((column) => {
                temp.push(parseFloat(row[column]));
            });
            filtered.push(temp);
        });

        let model = new TSNE({
            dim: 2,
            perplexity: $("#slider-tsne-perplexity").val(),
            learningRate: $("#slider-tsne-lr").val(),
            nIter: $("#slider-tsne-iterations").val(),
            metric: 'euclidean'
        });

        model.init({
            data: filtered,
            type: 'dense'
        });

        // `error`,  `iter`: final error and iteration number
        // note: computation-heavy action happens here
        let [error, iter] = model.run();

        // rerun without re-calculating pairwise distances, etc.
        //let [error, iter] = model.rerun();

        // `output` is unpacked ndarray (regular nested javascript array)
        let output = model.getOutput();

        //append the class variable again
        var recoupArr = [];
        for (var i = 0; i < output.length; i++) {
            recoupArr.push([
                /*x_axis: output[i][0],
                y_axis: output[i][1],
                class: data[i].class,*/
                output[i][0],
                output[i][1]
            ]);
        }


        //reset slider texts
        let sliderPerplexityText = $("#slider-tsne-perplexity-text");
        $("#slider-tsne-perplexity").unbind('input').on('input', (e) => {
            // console.log(e.target.value);
            sliderPerplexityText.html("Perplexity: " + e.target.value);
        });

        let sliderIterationText = $("#slider-tsne-iterations-text");
        $("#slider-tsne-iterations").unbind('input').on('input', (e) => {
            // console.log(e.target.value);
            sliderIterationText.html("Iterations: " + e.target.value);
        });

        let sliderLRText = $("#slider-tsne-lr-text");
        $("#slider-tsne-lr").unbind('input').on('input', (e) => {
            // console.log(e.target.value);
            sliderLRText.html("Learning Rate: " + e.target.value);
        });
        return recoupArr;
    }

    drawScatterplot(data) {

    }
}