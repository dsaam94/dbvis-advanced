import * as d3 from 'd3';
import * as $ from 'jquery';
import * as helpers from '../tools/helpers';
import * as mdsjs from '../libs/mds-js/mds';
import * as numeric from 'numeric';

export default class MDS {

    constructor() { }

    /*
     * Calculates and shows MDS distribution
     */
    create(data) {
        var distMatrix = helpers.distMatrix(data);

        var points = this.calculate(distMatrix);

        var classes = data.map(x => x["class"]);

        return helpers.plot2D(points, classes);
    }

    /*
     * Calculates lower dimension positions
     * Imported from mds.js at https://github.com/benfred/mds.js
     */
    calculate(distances, dimensions) {
        dimensions = dimensions || 2;

        // square distances
        var M = numeric.mul(-0.5, numeric.pow(distances, 2));

        // double centre the rows/columns
        function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
        var rowMeans = mean(M),
            colMeans = mean(numeric.transpose(M)),
            totalMean = mean(rowMeans);

        for (var i = 0; i < M.length; ++i) {
            for (var j = 0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }

        // take the SVD of the double centred matrix, and return the
        // points from it
        var ret = numeric.svd(M),
            eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(function (row) {
            return numeric.mul(row, eigenValues).splice(0, dimensions);
        });
    };

}