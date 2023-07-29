import * as d3 from 'd3';

export function loadDatasets() {

}

export async function loadDataset(filename) {
    let data = await d3.csv("datasets/" + filename + ".csv");
    //let data = await d3.csv("datasets/iris_labeled.csv");
    return data;
}
