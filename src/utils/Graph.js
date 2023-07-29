import * as d3 from 'd3';

//creates an array of size n x n
function makeArray(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(Array(n));
    }
    return arr;
}

export default class Graph {
    constructor(n) {
        this.nodeList = Array(n);
        this.graph = makeArray(n);
        this.distances = [];
    }

    addToGraph(node, parent, distance) {
        this.graph[node][parent] = distance;
        this.graph[parent][node] = distance;
        this.distances.push(distance);
    }

    addToList(index, x, y) {
        var newNode = new GraphNode(index, x, y);
        this.nodeList[index] = newNode;
    }

    getDistances() {
        this.distances = [];
        for (let i = 0; i < this.graph.length; i++) {
            for (let j = 0; j < this.graph.length; j++) {
                if (j < i) {
                    distances.push(this.graph[j][i]);
                } else {
                    break; //jumps to next column since no values of the row have to be taken into account
                }
            }
        }
        this.distances.sort(function (a, b) { return a - b }); //if no function specified -> ordered as strings
        return this.distances;
    }

    getQuantile(quantile) {
        return d3.quantile(this.distances, quantile);
    }

    //calculates outlying weight
    calculateOutlyingWeight() {
        this.distances.sort(function (a, b) { return a - b });
        let q75 = this.getQuantile(0.75);
        let q25 = this.getQuantile(0.25);
        //console.log(this.distances);
        //console.log("75th quantile: " + q75);
        //console.log("25th quantile: " + q25);
        return q75 + 1.5 * (q75-q25);
    }

    //calculates the outlying measure given a list of outlying edges [v1,v2]
    calculateOutlyingMeasure(nodes) {
        let nodeDist = 0;
        for (let i = 0; i < nodes.length; i++) {
            nodeDist += this.graph[nodes[i][0]][nodes[i][1]];
        }
        return nodeDist / d3.sum(this.distances);
    }

    //returns the neighbour of the node index or -1 if it has multiple
    getOnlyNeighbour(index) {
        let found = false;
        let parent = -1;
        for (let i = 0; i < this.graph.length; i++) {
            if (this.graph[index][i] != undefined) {
                if (found == true) {
                    return -1; //more than one neighbour
                } else {
                    found = true;
                    parent = i;
                }
            }
        }
        return parent;
    }

    //calculates nodes that only have one degree
    getOneDegreeNodes() {
        let weight = this.calculateOutlyingWeight();
        let outliers = [];
        for (let i = 0; i < this.graph.length; i++) {
            let neigh = this.getOnlyNeighbour(i);
            if (neigh != -1) {
                if (this.graph[i][neigh] > weight) {
                    outliers.push([i, neigh]);
                }
            }
        }
        return outliers;
    }

    getDegree(index) {
        return this.graph[index].filter(String).length;
    }
}

export class GraphNode {
    constructor(index, x, y) {
        this.index = index;
        this.x = x;
        this.y = y;
    }
}