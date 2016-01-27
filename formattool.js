// -----------------------------------
var fs = require('fs');
var http = require('http');
var https = require('https');
var _ = require('lodash');
var Q = require('q');
// -----------------------------------


var d = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); };
var dd = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); process.exit(); };

// format mini tool
var fff = fs.readFileSync(__dirname + "/data/rares.csv").toString().split("\n");


var delimiter = ",";

var colcount = fff[0].split(delimiter).length;

var colsize = [];

for( var c = 0; c < colcount; c++) {
    colsize.push(0);
}

_.each(fff, function (ff) {

    var line = ff.split(delimiter);

    for( var c = 0; c < colcount; c++) {

        var l = line[c].trim().length;

        if(colsize[c] < l) {
            colsize[c] = l;
        }

    }
});

var lines = [];
var uuid = -1;
_.each(fff, function (ff) {

    var line = [];
    //line.push(uuid);
    uuid++;

    var f = ff.split(delimiter);



    _.each(f, function(v, c) {

        v = v.trim();
        var spacecount = colsize[c] - v.length;

        for(var x=0; x < spacecount; x++) {
            v += " ";
        }

        line.push(v);

    });

    lines.push(line.join(" " + delimiter + " "));

});


/*
var lines = [];
_.each(fff, function (ff) {

    var f = ff.split(",");

    var x = f[0];

    f[0] = f[1];
    f[1] = f[2];
    f[2] = f[3];
    f[3] = x;

    lines.push(f.join(","));
});
*/

fs.writeFileSync(__dirname + "/data/rares2.csv", lines.join("\n"));



/*
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
*/