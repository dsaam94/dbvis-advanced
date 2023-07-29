import * as d3 from 'd3';
import * as $ from 'jquery';
import Graph from '../utils/Graph';

let graph = [];

export { graph };

export default class Algorithms {

    static calculateDistance(pos1, pos2, data) {
        //Euclidean distance
                return Math.sqrt(Math.pow(data[pos2][0] - data[pos1][0], 2) + Math.pow(data[pos2][1] - data[pos1][1], 2));
        
    }

    static deleteGraph() {
        graph = [];
    }

    static MST(data, id, radius, print) {
        let M = data.length;
        graph = new Graph(M);
        //console.log(graph);
        let start = Math.floor(Math.random() * (M + 1));
        let queue = [];
        let processed = [];
        let results = [];

        //initialize queue/processed arrays
        for (let i = 0; i < M; i++) {
            queue.push([-1,10000]);
        }

        processed.push(start);
        queue[start] = [-1,0];

        let selected = start;
        if (data[start]) {
            if (data[start][0]) {
                graph.addToList(selected, data[start][0], data[start][1]);
            }
        }
       
        let mindist = 10000;
        let minidx = -1;
        while (processed.length < M) {
            for (let i = 0; i < M; i++) {
                if (!processed.includes(i)) {
                    let d = this.calculateDistance(selected, i, data);
                    if (d < queue[i][1]) {
                        queue[i][1] = d;
                        queue[i][0] = selected;
                    }
                    if (queue[i][1] < mindist) {
                        mindist = queue[i][1];
                        minidx = i;
                    }
                }
            }
            processed.push(minidx);

            //add to MST graph
            graph.addToGraph(minidx, queue[minidx][0], parseFloat(mindist.toFixed(2)));
            graph.addToList(minidx, data[minidx][0], data[minidx][1]);

            if (print == true) {
                d3.select(id).select("svg")
                    .append("line")
                    .lower()
                    .attr("x1", data[minidx][0])
                    .attr("y1", data[minidx][1])
                    .attr("x2", data[queue[minidx][0]][0])
                    .attr("y2", data[queue[minidx][0]][1])
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            }

            selected = minidx;
            mindist = 10000;
            minidx = -1;
        }
        
        //outlier calculation
        let outliers = graph.getOneDegreeNodes();
        //console.log(outliers);
        let measure = graph.calculateOutlyingMeasure(outliers);
        //console.log("Outlying score: " + measure);

        //outlier highlighting
        for (let i = 0; i < outliers.length; i++) {
            let currentNode = graph.nodeList[outliers[i][0]];

            //let html_circle = "<cricle stroke=\"red\" fill=\"none\" stroke-width=\"2\" cx=\"" + currentNode.x + "\" cy=\"" + currentNode.y + "\" />";
            //$("svg").append(html_circle);

            d3.select(id).select("svg")
                .append("circle")
                .attr("cx", currentNode.x)
                .attr("cy", currentNode.y)
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2);
            
        }

        return measure;
        //graph.getDegree(index); //do for each circle
        
    }

}