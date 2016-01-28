// -----------------------------------
var fs  = require('fs');
var url = require('url');
var STATIC = require('node-static');
// -----------------------------------

var d = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); };
var dd = function(vari) { console.log(require('util').inspect(vari, {colors: true, depth: 7})); process.exit(); };

// --

// set env over NODE_ENV variable or by putting a file called "liveserver" in the main directory
var env = process.env.NODE_ENV;

if(!env) {
    if(fs.existsSync(__dirname + "/liveserver")) {
        env = "production";
    }
}


var respath, port, cfg = {};
if( env == 'production' ) {

    // ---- production-config
    respath = __dirname + '/client/final';
    cfg = {
        cache: 60 * 60 * 72  // 3 days
    };
    port = 80;

} else {

    // ---- development-config
    respath = __dirname + '/client/final';
    port = 4004;
    env = "development";

}

var buildnr = 1;

/* -- */

console.log("[" + env + "] resource-server listening on " + port + ".");

var fileServer = new STATIC.Server(respath, cfg);

require('http').createServer(function (request, response) {

    if(env == "development") {

        var pathname = url.parse(request.url,true).pathname;

        if ( pathname == "/" || pathname == "/index.html") {

            fs.readFile(respath + "/index.html", function (err, file) {
                var content = file.toString().replace("</body>", '<script>window.buildnr = ' + buildnr + ';</script><script src="dev.js"></script></body>');

                response.writeHead(200);
                response.end(content);
            });

        } else if ( pathname == "/getbuildnr" ) {

            response.writeHead(200);
            response.end(buildnr.toString());

        } else {

            request.addListener('end', function () {
                fileServer.serve(request, response);
            });
            request.resume();
        }

    } else {

        request.addListener('end', function () {
            fileServer.serve(request, response);
        });
        request.resume();
    }

}).listen(port);


/* --------------------------------------------------------- */

var less = require('less');
var ujs = require("uglify-js");
var Q = require('q');
var _ = require('lodash');


var bcfg = {

    lessdir: __dirname + "/client/src/styles",
    mainlessfile: __dirname + "/client/src/styles/main.less",

    jsdir: __dirname + "/client/src/scripts",
    jslist: __dirname + "/client/src/scripts/scripts.jslist",

    datafile: __dirname + "/client/src/data.json",
    datatime: __dirname + "/client/src/datatime.json",
    others: __dirname + "/client/src/others.json",

    tpldir: __dirname + "/client/src/tpls",
    indextpl: __dirname + "/client/src/tpls/index.tpl",
    sfromtpl: __dirname + "/client/src/tpls/systemfrom.tpl",
    stotpl: __dirname + "/client/src/tpls/systemto.tpl",
    raretpl: __dirname + "/client/src/tpls/rare.tpl",

    uglifyjs: false,

    builded_js: __dirname + "/client/final/script.js",
    builded_css: __dirname + "/client/final/style.css",
    builded_index: __dirname + "/client/final/index.html"
};


if(env == "development") {

    console.log("building one time.");
    build(function() {

        console.log("starting devmode watchers.");
        fs.watch(bcfg.lessdir, fileChanged);
        fs.watch(bcfg.jsdir, fileChanged);
        fs.watch(bcfg.tpldir, fileChanged);

    });
}

var pauseTimeout = null;
function fileChanged(e, filename) {

    if (!pauseTimeout) {

        console.log("change detected, building...");
        pauseTimeout = setTimeout(function() { pauseTimeout = null; }, 100);

        build();

    }

}


function build(callback) {

    Q.all([
        buildJs(),
        buildCss(),
        buildMarkup()
    ]).then(function(data) {

        Q.all([
            qWriteFile(bcfg.builded_js, data[0]),
            qWriteFile(bcfg.builded_css, data[1]),
            qWriteFile(bcfg.builded_index, data[2])
        ]).then(function() {

            buildnr++;
            console.log("done. (build: "+buildnr+")");

            if(callback) {
                callback();
            }

        });

    });
}

function buildMarkup() {
    var deferred = Q.defer();


    //todo: include a clean template engine. this is too specific here (but it works)

    Q.all([

        qReadFile(bcfg.datafile),
        qReadFile(bcfg.indextpl),
        qReadFile(bcfg.sfromtpl),
        qReadFile(bcfg.stotpl),
        qReadFile(bcfg.raretpl),
        qReadFile(bcfg.datatime),
        qReadFile(bcfg.others)

    ]).then(function(files) {

        var data = JSON.parse(files[0]);
        var index = files[1];

        var datatime = JSON.parse(files[5]).time;

        var from = [];
        var to = [];
        _.each(data, function(system, i) {

            var thisfrom = files[2];
            var thisto = files[3];

            thisfrom = thisfrom.replace("{{i}}", i);
            thisfrom = thisfrom.replace("{{name}}", system.name);
            thisfrom = thisfrom.replace("{{x}}", system.x.toFixed(1));
            thisfrom = thisfrom.replace("{{y}}", system.y.toFixed(1));
            thisfrom = thisfrom.replace("{{z}}", system.z.toFixed(1));

            thisto = thisto.replace("{{i}}", i);
            thisto = thisto.replace("{{name}}", system.name);
            thisto = thisto.replace("{{x}}", system.x.toFixed(1));
            thisto = thisto.replace("{{y}}", system.y.toFixed(1));
            thisto = thisto.replace("{{z}}", system.z.toFixed(1));

            if(system.needs_permit) {
                thisfrom = thisfrom.replace("{{permit_start}}", "");
                thisfrom = thisfrom.replace("{{permit_end}}", "");

                thisto = thisto.replace("{{permit_start}}", "");
                thisto = thisto.replace("{{permit_end}}", "");
            } else {
                thisfrom = thisfrom.replace(/\{\{permit_start}}.+\{\{permit_end}}/, "");
                thisto = thisto.replace(/\{\{permit_start}}.+\{\{permit_end}}/, "");
            }

            thisto = thisto.replace("{{allegiance}}", formatLargeNums(system.allegiance));
            thisto = thisto.replace("{{population}}", formatLargeNums(system.population));

            var thisrares = [];
            _.each(system.rares, function(rare, r) {

                var thisrare = files[4];

                thisrare = thisrare.replace("{{name}}", rare.name);

                thisrare = thisrare.replace("{{type}}", rare.station.type);
                thisrare = thisrare.replace("{{padsize}}", rare.station.max_landing_pad_size);
                thisrare = thisrare.replace("{{station_name}}", rare.station.name);
                thisrare = thisrare.replace("{{distance}}", formatLargeNums(rare.station.distance_to_star));
                thisrare = thisrare.replace("{{faction}}", rare.station.faction);

                thisrare = thisrare.replace("{{allegiance}}", rare.station.allegiance);
                thisrare = thisrare.replace("{{government}}", rare.station.government);
                thisrare = thisrare.replace("{{economies}}", rare.station.economies.join(", "));

                thisrare = thisrare.replace("{{rareid}}", rare.uid);

                if(rare.station.distance_to_star >= 1000) {
                    thisrare = thisrare.replace("{{far1_start}}", "");
                    thisrare = thisrare.replace("{{far1_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{far1_start}}.+\{\{far1_end}}/, "");
                }

                if(rare.station.distance_to_star >= 5000) {
                    thisrare = thisrare.replace("{{far2_start}}", "");
                    thisrare = thisrare.replace("{{far2_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{far2_start}}.+\{\{far2_end}}/, "");
                }

                if(rare.station.distance_to_star >= 100000) {
                    thisrare = thisrare.replace("{{far3_start}}", "");
                    thisrare = thisrare.replace("{{far3_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{far3_start}}.+\{\{far3_end}}/, "");
                }

                if(rare.suppressed) {
                    thisrare = thisrare.replace("{{suppressed_start}}", "");
                    thisrare = thisrare.replace("{{suppressed_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{suppressed_start}}.+\{\{suppressed_end}}/, "");
                }

                if(rare.often_illegal) {
                    thisrare = thisrare.replace("{{oftenillegal_start}}", "");
                    thisrare = thisrare.replace("{{oftenillegal_end}}", "");

                    thisrare = thisrare.replace(/\{\{notoftenillegal_start}}.+\{\{notoftenillegal_end}}/, "");
                } else {
                    thisrare = thisrare.replace(/\{\{oftenillegal_start}}.+\{\{oftenillegal_end}}/, "");

                    thisrare = thisrare.replace("{{notoftenillegal_start}}", "");
                    thisrare = thisrare.replace("{{notoftenillegal_end}}", "");
                }
                
                if(rare.station.has_blackmarket) {
                    thisrare = thisrare.replace("{{blackmarket_start}}", "");
                    thisrare = thisrare.replace("{{blackmarket_end}}", "");

                    thisrare = thisrare.replace(/\{\{noblackmarket_start}}.+\{\{noblackmarket_end}}/, "");
                } else {
                    thisrare = thisrare.replace(/\{\{blackmarket_start}}.+\{\{blackmarket_end}}/, "");

                    thisrare = thisrare.replace("{{noblackmarket_start}}", "");
                    thisrare = thisrare.replace("{{noblackmarket_end}}", "");
                }
                
                if(rare.station.has_market) {
                    thisrare = thisrare.replace("{{market_start}}", "");
                    thisrare = thisrare.replace("{{market_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{market_start}}.+\{\{market_end}}/, "");                    
                }

                if(rare.station.has_refuel) {
                    thisrare = thisrare.replace("{{refuel_start}}", "");
                    thisrare = thisrare.replace("{{refuel_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{refuel_start}}.+\{\{refuel_end}}/, "");                    
                }

                if(rare.station.has_repair) {
                    thisrare = thisrare.replace("{{repair_start}}", "");
                    thisrare = thisrare.replace("{{repair_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{repair_start}}.+\{\{repair_end}}/, "");                    
                }

                if(rare.station.has_rearm) {
                    thisrare = thisrare.replace("{{rearm_start}}", "");
                    thisrare = thisrare.replace("{{rearm_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{rearm_start}}.+\{\{rearm_end}}/, "");                    
                }

                if(rare.station.has_outfitting) {
                    thisrare = thisrare.replace("{{outfitting_start}}", "");
                    thisrare = thisrare.replace("{{outfitting_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{outfitting_start}}.+\{\{outfitting_end}}/, "");                    
                }

                if(rare.station.has_shipyard) {
                    thisrare = thisrare.replace("{{shipyard_start}}", "");
                    thisrare = thisrare.replace("{{shipyard_end}}", "");
                } else {
                    thisrare = thisrare.replace(/\{\{shipyard_start}}.+\{\{shipyard_end}}/, "");                    
                }

                /* -- */

                var tonnes = "";
                for(var t=1; t <= rare.max_cap; t++) {

                    var c = "";
                    if(t <= rare.supply_rate_min) {
                        c = ' class="sure"';
                    } else if(t <= rare.supply_rate_max) {
                        c = ' class="probable"'
                    }

                    tonnes += "<div"+c+"></div>";
                }
                thisrare = thisrare.replace("{{tonnes}}", tonnes);

                thisrare = thisrare.replace("{{max}}", rare.max_cap+" t");

                var supply;
                if(rare.supply_rate_min === null || rare.supply_rate_max === null) {
                    supply = "no data";
                } else {

                    if(rare.supply_rate_min === rare.supply_rate_max) {
                        supply = "supply "+rare.supply_rate_min+" t";
                    } else {
                        supply = "supply "+rare.supply_rate_min+"-"+rare.supply_rate_max+" t";
                    }

                }
                thisrare = thisrare.replace("{{supply}}", supply);


                thisrare = thisrare.replace("{{price}}", formatLargeNums(rare.price));

                /* -- */

                thisrares.push(thisrare);
            });

            thisto = thisto.replace("{{rares}}", thisrares.join("\n"));

            from.push(thisfrom);
            to.push(thisto);
        });

        index = index.replace("{{from}}", from.join("\n"));
        index = index.replace("{{to}}", to.join("\n"));

        index = index.replace("{{datatime}}", datatime);

        index = index.replace("{{stardata}}", files[0].replace(/'/g, "\\'"));
        index = index.replace("{{otherstars}}", files[6].replace(/'/g, "\\'"));

        deferred.resolve(index);
    });

    return deferred.promise;
}

function formatLargeNums(num) {

    if(num === null) {
        return "unknown";
    } else if(num > 1000000000) {
        return (num / 1000000000).toFixed(1) + " Billion";
    } else if(num > 1000000) {
        return (num / 1000000).toFixed(1) + " Million";
    } else {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8202;");
    }
}

function buildCss() {
    var deferred = Q.defer();

    fs.readFile(bcfg.mainlessfile, function(err, lessfile) {

        less.render(lessfile.toString(), {
            paths: [bcfg.lessdir],
            cleancss: true,
            compress: true,
            filename: bcfg.mainlessfile
        }).then(function (output) {

            deferred.resolve(output.css.toString());

        }, function (error) {
            printError(error);
            deferred.resolve({});
        });

    });

    return deferred.promise;
}

function buildJs() {
    var deferred = Q.defer();

    fs.readFile(bcfg.jslist, function(err, listfile) {

        var list = listfile.toString().split("\n");

        var fullpathlist = [];
        for (var i = 0; i < list.length; i++) {

            var item = list[i].replace(/\s/g, "");

            if (item != "" && !(/^#/.test(item))) {

                var fp = bcfg.jsdir + "/" + item;

                if (fs.existsSync(fp)) {
                    fullpathlist.push(fp);
                } else {
                    printError("Datei '" + fp + "' existiert nicht!");
                }
            }
        }

        var js = "";

        if (bcfg.uglifyjs) {
            js = ujs.minify(fullpathlist).code;

            deferred.resolve(js);
        } else {

            var filefncs = [];
            _.each(fullpathlist, function (filename) {
                filefncs.push(qReadFile(filename));
            });

            Q.all(filefncs).then(function(data) {
                deferred.resolve(data.join("\n"));
            });

        }

    });

    return deferred.promise;
}

function qReadFile(filename) {
    var deferred = Q.defer();

    fs.readFile(filename, function(err, file) {

        deferred.resolve(file.toString());

    });

    return deferred.promise;
}

function qWriteFile(filename, data) {
    var deferred = Q.defer();

    fs.writeFile(filename, data, function() {
        deferred.resolve();
    });

    return deferred.promise;
}


function printError(msg) {
    console.log();
    d(msg);
    console.log();
}