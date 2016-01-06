// -----------------------------------
var fs = require('fs');
var http = require('http');
var https = require('https');
var _ = require('lodash');
var Q = require('q');
// -----------------------------------


var d = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); };
var dd = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); process.exit(); };


var fff = fs.readFileSync(__dirname + "/data/raresfromforum.csv").toString().split("\n");
var sss = fs.readFileSync(__dirname + "/data/raresfromspreadsheet.csv").toString().split("\n");

var nl = [];
_.each(fff, function(ff,i) {

    if(i === 0) {

        nl.push(ff+",supply_rate_min,supply_rate_max");

    } else {

        var f = ff.split(",");

        if(f.length > 1) {

            var name = f[1].replace(/"/g, '');


            var mmm = _.find(sss, function (ss) {
                var s = ss.split(",");
                return s[3] == name;
            });

            var smin = "";
            var smax = "";

            if (mmm) {
                var xxx = mmm.split(",")[1];

                if (xxx != "ND") {

                    var yyy = xxx.split("-");

                    smin = yyy[0];

                    if (yyy.length > 1) {
                        smax = yyy[1];
                    } else {
                        smax = smin;
                    }

                }
            }

            nl.push(ff + "," + smin + "," + smax);

        }
    }

});

fs.writeFileSync(__dirname + "/data/raresfromforum2.csv", nl.join("\n"));
