// -----------------------------------
var fs = require('fs');
var http = require('http');
var https = require('https');
var _ = require('lodash');
var Q = require('q');
// -----------------------------------


var d = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); };
var dd = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); process.exit(); };

downloadData(function() {
    aggregate(convertForumData());
});


// ----

function convertForumData() {

    var lines = fs.readFileSync(__dirname + "/data/raresfromforum.csv").toString().split("\n");

    var keys = lines[0].split(",");

    var list = [];
    _.each(lines, function(line, i) {

        if(i !== 0) {

            line = line.split(",");

            if(line.length > 1) {

                var obj = {};
                _.each(keys, function (key, col) {

                    obj[key] = line[col].replace(/"/g, "");

                });
                list.push(obj);

            }
        }
    });

    return list;
}

function aggregate(rares) {


    //var rares = JSON.parse(fs.readFileSync(__dirname + "/data/rares.json")); // self written (and corrected) from elite-wiki
    var stations = JSON.parse(fs.readFileSync(__dirname + "/data/stations.json")); // eddb
    var systems = JSON.parse(fs.readFileSync(__dirname + "/data/systems.json")); // eddb

    var fulldata = [];

    _.each(rares, function(rare) {

        var systemdata = _.find(systems, function (system) {
            return system.name == rare.system;
        });

        if(!systemdata) {
            d("system not found");
            dd(rare);
        }

        var system = _.find(fulldata, function(f) { return f.id == systemdata.id; });

        if(!system) {
            system = systemdata;
            fulldata.push(system);
        }

        if(!system.rares) {
            system.rares = [];
        }

        var stationdata = _.find(stations, function (station) {
            return station.name == rare.station && system.id == station.system_id;
        });

        if(!stationdata) {
            d("station not found");
            dd(rare);
        }

        system.rares.push({
            name: rare.item,
            category: rare.category,
            price: parseInt(rare.price),
            max_cap: rare.max_cap,
            suppressed: (rare.suppressed === "t"),
            sc_est_mins: parseInt(rare.sc_est_mins),
            often_illegal: (rare.often_illegal === "t"),
            est_sell150: parseFloat(rare.est_sell150),
            est_unit_profit150: parseFloat(rare.est_unit_profit150),
            est_total_profit150: parseFloat(rare.est_total_profit150),
            station: stationdata
        });

    });


    // other systems
    var others = [];
    var bounds = 400;
    _.each(systems, function(s) {

        if( !_.find(fulldata, function(f) { return f.id == s.id; }) ) {

            if( s.x > -bounds && s.x < bounds &&
                s.y > -bounds && s.y < bounds &&
                s.z > -bounds && s.z < bounds ) {

                var m = s.name.match(/\s/g);

                if(!m || s.allegiance !== null || m.length <= 1 ) {


                    others.push({
                        name: s.name,
                        x: s.x,
                        y: s.y,
                        z: s.z,
                        allegiance: s.allegiance
                    });

                }

            }
        }

    });


    //cleanup
    _.each(fulldata, function(f) {

        delete f.id;
        delete f.simbad_ref;
        delete f.updated_at;

        _.each(f.rares, function(r) {

            delete r.station.selling_modules;
            delete r.station.selling_ships;
            delete r.station.updated_at;
            delete r.station.shipyard_updated_at;
            delete r.station.outfitting_updated_at;
            delete r.station.market_updated_at;
            delete r.station.id;
            delete r.station.system_id;

        });

        if(f.rares.length > 1) {

            f.rares = _.sortBy(f.rares, function(r) {
                return r.station.distance_to_star;
            });

        }


    });




//  dd(fulldata);

    fs.writeFileSync(__dirname + "/client/src/data.json", JSON.stringify(fulldata));
    fs.writeFileSync(__dirname + "/client/src/others.json", JSON.stringify(others));
    fs.writeFileSync(__dirname + "/client/src/datatime.json", JSON.stringify({time: niceDate(new Date())}));

}

// ----

function downloadData(callback) {

    Q.all([

        getDataFile("https://eddb.io/archive/v4/systems.json", "systems.json"),
        getDataFile("https://eddb.io/archive/v4/stations.json", "stations.json")
       // getDataFile("https://eddb.io/archive/v4/commodities.json", "commodities.json"),
       // getDataFile("https://eddb.io/archive/v4/modules.json", "modules.json"),
        //getDataFile("https://eddb.io/archive/v4/listings.csv", "listings.csv")

    ]).then(callback);

}

// ----

function getDataFile(url, filename) {
    var deferred = Q.defer();

    var file = fs.createWriteStream(__dirname + "/data/"+filename);
    var request = https.get(url, function(response) {
        response.pipe(file);

        file.on('finish', function() {
            file.close(function() {
                deferred.resolve({});
            });
        });
    });


    return deferred.promise;
}

function niceDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}