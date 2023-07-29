/// Completely done by Pablo

import * as d3 from 'd3';
import * as $ from 'jquery';

export default class Hilbert {

    static createCurve(order, index) {
        this.size = 1;
        var pathString = "M0 0L0 0";

        var n = Math.pow(2, order);

        var prev = this.d2xy(n, index);

        for (var i = 1; i < Math.pow(4, order); i += 1) {
            var curr = this.d2xy(n, i);

            curr[0] > prev[0]
                ? pathString += "h"
                : (curr[0] < prev[0]
                    ? pathString += "h-"
                    : (curr[1] > prev[1]
                        ? pathString += "v"
                        : pathString += "v-"
                    )
                );

            pathString += this.size;

            prev = curr;
        }

        return pathString;
        
    }

    //convert (x,y) to d
    static xy2d(n, x, y) {
        var rx, ry, d = 0;
        for (var s = n / 2; s > 0; s /= 2) {
            rx = (x & s) > 0;
            ry = (y & s) > 0;
            d += s * s * ((3 * rx) ^ ry);
            [x,y] = this.rot(n, x, y, rx, ry);
        }
        return d;
    }

    //convert d to (x,y)
    static d2xy(n, d) {
        var rx, ry, t = d;
        var x = 0;
        var y = 0;

        for (var s = 1; s < n; s *= 2) {
            rx = 1 & (t / 2);
            ry = 1 & (t ^ rx);
            [x, y] = this.rot(s, x, y, rx, ry);
            x += s * rx;
            y += s * ry;
            t /= 4;
        }

        return [x, y];
    }

    //rotate/flip a quadrant appropriately
    static rot(n, x, y, rx, ry) {
        var x, y;
        if (ry == 0) {
            if (rx == 1) {
                x = n - 1 - x;
                y = n - 1 - y;
            }

            //Swap x and y
            var t = x;
            x = y;
            y = t;
            
        }
        return [x, y];
    }



}