import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import { registerJQueryD3Click } from './tools/helpers';
import { loadDataset } from './tools/data-manager.js';
import Scatterplot from './components/Scatterplot';
import ScatterplotMatrix from './components/ScatterplotMatrix';
import Algorithms from './tools/Algorithms';
import ParallelCoordinatePlot from './components/ParallelCoordinatePlot';
import MDS from './components/MDS';
import TSNEplotter from './components/TSNEplotter';
import Pixel from './components/Pixel';
import { alpha, beta } from './components/ParallelCoordinatePlot';
registerJQueryD3Click();

let SPLOM = [];
let PCP = [];
let MDSObject = [];
let TSNEObject = [];
let pixel = [];
let holder = "";
$(document).ready(function () {

    /* Load files */
    let files = [
        'iris_labeled',
        'wine_labeled',
        'artificial_labeled',
        'mtcars_labeled',
        'education_labeled',
        'test'
    ];

    /* Load files into dropdown items */
    let change = function (txt) {
        $(".dropdown .dropdown-menu").append("<a id=\"" + txt + "\" class=\"dropdown-item\" href=\"#\">" + txt + "</a>");
    }
    for (var i = 0; i < files.length; i++) {
        change(files[i]);
    }

    SPLOM = new ScatterplotMatrix();

    PCP = new ParallelCoordinatePlot();

    MDSObject = new MDS();

    TSNEObject = new TSNEplotter();

    pixel = new Pixel();

    /* On-click dropdown menu */
    $(".dropdown-item").click(function () { 

        if ($("#scatterplot").hasClass("active")) { //scatterplot tab is active

            createScatterplot($(this).attr('id'));

        }

        else if ($("#scatterplot-matrix").hasClass("active")) {  //SPLOM tab is active

            SPLOM.clearSVG();

            createSPLOM($(this).attr('id'));
        }

        else if ($("#pcplot").hasClass("active")) {  //PCP tab is active

            createPCP($(this).attr('id'));

        }

        else if ($("#mds").hasClass("active")) {    //MDS tab is active

            createMDS($(this).attr('id'));

        }

        else if ($("#pixel").hasClass("active")) {    //Pixel tab is active

            createPixel($(this).attr('id'));

        }

        else if ($("#tsne").hasClass("active")) {  //TSNE tab is active
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
            holder = $(this).attr('id');
        }
    });

    $("#tsne-button").click(function () {

        createTSNE(holder);

    });
});

//calculates mst
function MSTfunction() {
    if (this.checked) {
        SPLOM.clearSVG();
        var circleArray = $("circle");
        var positions = [];
        circleArray.each(function (idx, el) {//go through each circle

            var x_val = parseFloat($(el).attr('cx')).toFixed(2);
            var y_val = parseFloat($(el).attr('cy')).toFixed(2);

            positions.push([x_val, y_val]);
        });
        //console.log(positions);

        Algorithms.MST(positions, "#scatterplot", 10, true);
        //console.log("Clicked");
        //$(".checkbox input").prop("checked", true);
    }
    else {

        createScatterplot(holder);
    }
}

// on dataset(dropdown) click: Reads data and creates scatter plot
function createScatterplot(id) {
    holder = id;
    //delete previous graph
    Algorithms.deleteGraph();

    //Load selected dataset (promise as d3.csv is async)
    let loaded = loadDataset(id);
    loaded.then(function (data) {
        //console.log(data);
        var content = $(".tab-content div.active");
        $(content).find("svg").remove();
        
        //Checkbox function and turn off
        $(".checkbox input").unbind('click').click(MSTfunction);


        //create scatterplot
        $(content).append(Scatterplot.CreateScatterplot(data));

    }, function (err) {
        console.log(err);
    });
}

// on dataset(dropdown) click: Reads data and creates SPLOM
function createSPLOM(id) {
    Algorithms.deleteGraph();
    //Load selected dataset (promise as d3.csv is async)
    let loaded = loadDataset(id);
    loaded.then(function (data) {
        var content = $(".tab-content div.active");
        $(content).find("#spom-vis > div").remove();
        //create scatterplot
        SPLOM.clearSVG();
        SPLOM.create(data);
        //console.log(data);
     

        //Checkbox function and turn off
        $(".checkbox-splom input").unbind('click').click(function() {
            createSPLOM(id)
        });


    }, function (err) {
        console.log(err);
    });

}

//create PCP from the main ParallelCoordinatePlot class
function createPCP(id) {

    //Load selected dataset (promise as d3.csv is async)
    let loaded = loadDataset(id);
    loaded.then(function (data) {
        //console.log(data);
        var content = $("#pcp-vis");
        $(content).find("svg").remove();

        ////Checkbox function and turn off
        //$(".checkbox input").prop("checked", false);
        //$(".checkbox input").click(MSTfunction);

        //create scatterplot
        $(content).append(PCP.createPCP(data));

        //slider initialization
        let sliderAlpha = d3.select("#slider-alpha")
            .attr("min", 0)
            .attr("max", 1)
            .attr("step", 0.001)
            .attr("value", 0)
            .node();

        let sliderBeta = d3.select("#slider-beta")
            .attr("min", 0)
            .attr("max", 1)
            .attr("step", 0.001)
            .attr("value", 0)
            .node();

        $("#slider-alpha").on("change", function () {
            $(content).find("svg").remove();
            PCP.changeAlpha($(this).val());
            $(content).append(PCP.createPCP(data));
            d3.select("#alpha-text").node().innerHTML = "Alpha: " + $(this).val();
        });

        $("#slider-beta").on("change", function () {
            $(content).find("svg").remove();
            PCP.changeBeta($(this).val());
            $(content).append(PCP.createPCP(data));
            d3.select("#beta-text").node().innerHTML = "Beta: " + $(this).val();
        });

    }, function (err) {
        console.log(err);
    });
}

//create MDS from the main MDS class
function createMDS(id) {

    //Load selected dataset (promise as d3.csv is async)
    let loaded = loadDataset(id);
    loaded.then(function (data) {
        var content = $("#mds-vis");
        $(content).find("svg").remove();

        //create scatterplot
        $(content).append(MDSObject.create(data));
        //console.log(data);

    }, function (err) {
        console.log(err);
    });

}

//create TSNE from the main TSNE class
function createTSNE(id) {

    //Load selected dataset (promise as d3.csv is async)
    let loaded = loadDataset(id);
    loaded.then(function (data) {
        var content = $("#tsne-vis");
        $(content).find("svg").remove();

        //create scatterplot
        $(content).append(TSNEObject.create(data));
        //console.log(data);

    }, function (err) {
        console.log(err);
    });

}

//create pixel from the main MDS class
function createPixel(id) {

    //Load selected dataset (promise as d3.csv is async)
    let loaded = loadDataset(id);
    loaded.then(function (data) {
        var content = $("#pixel-vis");
        $(content).find("svg").remove();

        //create scatterplot
        $(content).append(pixel.create(data, undefined));
        //console.log(data);

    }, function (err) {
        console.log(err);
    });

}