/*!
 *  ----------------------------------------------------------------------------------------
 *           _
 *       ___| |_ __ _ _ __ _ __ ___   __ _ _ __
 *      / __| __/ _` | '__| '_ ` _ \ / _` | '_ \
 *      \__ \ || (_| | |  | | | | | | (_| | |_) |
 *      |___/\__\__,_|_|  |_| |_| |_|\__,_| .__/
 *                                        |_|
 *        2016 - Frédéric Worm
 *  ----------------------------------------------------------------------------------------
 */

( function () {

    var sizefactor = 1.5; // elite coords -> world coords
    var maxpilarsize = 25; // in elite coords (ly)
    var gridmeshsize = 25;

    var standardcam_x = 0;
    var standardcam_y = 90;
    var standardcam_z = 60;

    var initSelectIndex = 8; // Alpha Centauri

    var mapcontainer = $("#map");
    var mapnode;
    var renderer;
    var devicePixelRatio;
    var scene;
    var camera;
    var controls;
    var stats;

    var grid;
    var gridplane;
    var gridcursor, gridcoordsctx, gridcoordstexture;

    var distlineMesh;

    var map_w = 0, map_h = 0;

    var starobjs = [];
    var starcirlcesforraycasting = [];

    var raycaster;

    var mouse_x = null;
    var mouse_y = null;

    var showfps = false;

    var infocontainer = $("#info");

    $(document).ready(function() {
        init();
    });


    function init() {

        initCoffee();
        initTabs();
        initRenderer();
        initScene();

        ensureLoadedFont("fonts/michroma-v7-latin-regular.woff2", function() {

            initObjects();
            //initOtherStars();
            initEvents();
            initLocalLoading();


            // Cam-Pos initial
            setToStar(initSelectIndex);
            selectByIndex(initSelectIndex);

            renderer.render(scene, camera);


            //Loop starten
            (function animloop(){
                requestAnimationFrame(animloop);
                update();
            })();


        });
    }

    function initCoffee() {

        $(".coffeelink").on("click", function(e) {

            $("form").submit();

            $("svg>path").css({
                "fill": "#fff"
            });

            $("svg").css({
                "position": "fixed",
                "z-index": 1000,
                "top":"10px",
                "right":"10px"
            }).animate({
                "width": "8000px",
                "height": "8000px"
            }, 3000);

            e.preventDefault();

        });

    }

    function ensureLoadedFont(url, callback) {

        var image = new Image;
        image.src = url;
        image.onerror = function() {
            callback();
        };

    }

    var crx = 0, cry = 0, crz = 0;
    function update() {

        if(showfps) {
            stats.update();
        }
        controls.update();

        updateAnimation();

        placeGrid();
        placeCursor();

        var ncrx = camera.rotation.x;
        var ncry = camera.rotation.y;
        var ncrz = camera.rotation.z;

        if( ncrx !== crx || ncry !== cry || ncrz !== crz ) {

            crx = ncrx;
            cry = ncry;
            crz = ncrz;

            _.each(starobjs, function(sm) {
                sm.starObj.rotation.x = ncrx;
                sm.starObj.rotation.y = ncry;
                sm.starObj.rotation.z = ncrz;
            });

        }

        updateMouse();

        renderer.render(scene, camera);
    }


    var animationTarget = null;
    var animationStart = null;
    var animationStartCam = null;
    var animationStartTime = null;
    var animationDuration = 1000;

    function animateToStar(index) {

        var s = stardata[index];

        animationTarget = { x: s.x * sizefactor, y: s.y * sizefactor, z: s.z * sizefactor };
        animationStart = { x:controls.target.x, y:controls.target.y, z:controls.target.z };
        animationStartCam = { x:camera.position.x, y:camera.position.y, z:camera.position.z };
        animationStartTime = Date.now();

    }

    function animateToCoords(x, y, z) {

        animationTarget = { x: x * sizefactor, y: y * sizefactor, z: z * sizefactor };
        animationStart = { x:controls.target.x, y:controls.target.y, z:controls.target.z };
        animationStartCam = { x:camera.position.x, y:camera.position.y, z:camera.position.z };
        animationStartTime = Date.now();

    }


    function updateAnimation() {

        if(animationTarget) {

            var a = (Date.now() - animationStartTime) / animationDuration;

            if (a > 1) { a = 1; }

            var vx = ((animationTarget.x - animationStart.x) * a);
            var vy = ((animationTarget.y - animationStart.y) * a);
            var vz = ((animationTarget.z - animationStart.z) * a);

            controls.target.x = vx + animationStart.x;
            controls.target.y = vy + animationStart.y;
            controls.target.z = vz + animationStart.z;

            camera.position.x = vx + animationStartCam.x;
            camera.position.y = vy + animationStartCam.y;
            camera.position.z = vz + animationStartCam.z;

            if( a == 1) {
                animationTarget = null;
                animationStart = null;
            }

        }

    }


    var hoveredMesh = null;
    var selectedMesh = null;
    var selectedOriginalColor = null;
    var hoveredOriginalColor = null;
    var hoverColor = 0xcc7830;
    var selectColor = 0xffeeaa;
    function updateMouse() {

        if(mouse_x !== null) {

            raycaster.setFromCamera({x: mouse_x, y: mouse_y}, camera);
            var intersects = raycaster.intersectObjects(starcirlcesforraycasting);

            if (intersects.length) {

                intersects = _.filter(intersects, function(ins) { return ins.object.parent.visible; });

                if (intersects.length) {

                    var o = intersects[0].object;

                    if (hoveredMesh != o) {
                        // first time hovered inside a new mesh

                        if (hoveredMesh) {
                            // there is an old mesh, reset it (hovered out of another)
                            hoveredMesh.material.color.setHex(hoveredOriginalColor);
                        }

                        hoveredMesh = o;
                        hoveredOriginalColor = o.material.color.getHex();

                        if (o != selectedMesh) {
                            o.material.color.setHex(hoverColor);
                        }

                        //mapcontainer.css("cursor", "pointer");

                        updateInfos();
                    }

                }

            } else {

                if(hoveredMesh) {
                    // hovered out of a mesh, no mesh hovered anymore

                    hoveredMesh.material.color.setHex(hoveredOriginalColor);

                    //mapcontainer.css("cursor", "default");

                    hoveredMesh = null;
                    hoveredOriginalColor = null;

                    updateInfos();
                }

            }

        }

    }


    function selectByIndex(index) {

        if(selectedMesh) {
            selectedMesh.material.color.setHex(selectedOriginalColor);
        }

        if(index >= 0) {

            selectedMesh = starcirlcesforraycasting[index];
            selectedOriginalColor = selectedMesh.material.color.getHex();

        } else {

            selectedMesh = null;
            selectedOriginalColor = null;
        }

        updateInfos();

        if(colorizer.val() == "rare") {
            colorByRareDistance();
        }

        if(selectedMesh) {
            selectedMesh.material.color.setHex(selectColor);
        }

    }


    var colorizer;
    function initEvents() {

        $(window).on("resize", function() {
            resize();
        });

        mapcontainer.on("mousemove", function(e) {

            if(controls.getState() === -1) {

                var rect = renderer.domElement.getBoundingClientRect();

                mouse_x = ( ( e.clientX - rect.left ) / renderer.domElement.width ) * 2 - 1;
                mouse_y = -( ( e.clientY - rect.top ) / renderer.domElement.height ) * 2 + 1;

                if (devicePixelRatio != 1) {
                    mouse_x = (mouse_x * devicePixelRatio) + devicePixelRatio/2;
                    mouse_y = (mouse_y * devicePixelRatio) - devicePixelRatio/2;
                }

            } else {
                mouse_x = null;
                mouse_y = null;
            }

        });

        mapcontainer.on("click", function() {

            if(controls.getState() === -1) {

                if(hoveredMesh && hoveredMesh != selectedMesh) {

                    if(selectedMesh) {
                        selectedMesh.material.color.setHex(selectedOriginalColor);
                    }

                    selectedOriginalColor = hoveredOriginalColor;
                    hoveredOriginalColor = selectColor;
                    selectedMesh = hoveredMesh;

                    updateInfos();

                    if(colorizer.val() == "rare") {
                        colorByRareDistance();
                    }

                    selectedMesh.material.color.setHex(selectColor);

                    selectTab("info");
                }

            }

        });

        mapcontainer.on("dblclick", function() {

            if(controls.getState() === -1) {

                if(hoveredMesh) {

                    //setToStar(hoveredMesh.dataIndex);
                    animateToStar(hoveredMesh.dataIndex);

                }

            }

        });

        colorizer = $("#color").selectmenu();
        colorizer.on("selectmenuchange", function() {
            colorizingChange();
            $("#color-button").blur(); //shitty jquery-ui behaviour
        });


        $(".addtoroute").button().on("click", function() {

            addToRoute($(this).attr("data-id"));

        });

        $.ajax({
            url: "others.json",
            method: "GET",
            dataType: "json"
        }).done(function(others) {


            var acdata = [];
            _.each(stardata, function(s, i) {
                acdata.push({ label: s.name, category: "system", index: i });

                _.each(s.rares, function(r) {

                    acdata.push({ label: r.name, category: "rare", index: i  });
                    //acdata.push({ label: r.station.name, category: "station", index: i  });

                });

            });

            _.each(others, function(o) {
                acdata.push({ label: o.name, category: "other", x: o.x, y: o.y, z: o.z });
            });

            var search = $("#search").catcomplete({
                delay: 0,
                minLength: 3,
                source: acdata,
                select: function() {

                    var item = _.find(acdata, function(i) { return i.label === search.val(); });

                    if(item.category == "other") {
                        animateToCoords(item.x, item.y, item.z);
                    } else {
                        animateToStar(item.index);
                        selectByIndex(item.index);
                    }

                }
            });

            $(".ui-autocomplete").css("max-height", window.innerHeight - $(".ui-autocomplete-input")[0].getBoundingClientRect().top - 40 + "px");

        });

        // --

        var showfpschecker = $("#showfps");

        showfps = showfpschecker.is(":checked");
        if(showfps) {
            $("#stats").show();
        } else {
            $("#stats").hide();
        }
        showfpschecker.on("click", function() {
            showfps = $("#showfps").is(":checked");

            if(showfps) {
                $("#stats").show();
            } else {
                $("#stats").hide();
            }
        });


        // --

        updateFilters();

        $(  "#showsuppressed, " +
            "#shownoblackmarket, " +
            "input[name='illegal_option'], " +
            "input[name='sdistance_option']").on("click", function() {

            updateFilters();

        });

        // --

        $("#saveroute").button({disabled: true}).on("click", function() {
            saveRouteStorage();
        });


        $("#savename").on("keydown", function(e) {
            setTimeout(function() {
                $("#saveroute").button("option", "disabled", !(route.length >= 1 && $("#savename").val() !== "" && getActRouteIndex() == -1 ));
            },1);
        });

        // --

        var shareroutetextbox = $("#shareroute");
        shareroutetextbox.on("click", function() {

            this.select();

        });
        shareroutetextbox.val("");


    }


    var filter_showsuppressed = null;
    var filter_shownoblackmarket = null;
    var filter_showillegal = null;
    var filter_sdistance = null;

    var nodes_all = infocontainer.find(".system .rares .rare");
    var nodes_noblackmarket = infocontainer.find(".system .rares .noblackmarket");
    var nodes_suppressed = infocontainer.find(".system .rares .suppressed");
    var nodes_oftenillegal = infocontainer.find(".system .rares .oftenillegal");
    var nodes_notoftenillegal = infocontainer.find(".system .rares .notoftenillegal");
    var nodes_far1 = infocontainer.find(".system .rares .far1");
    var nodes_far2 = infocontainer.find(".system .rares .far2");
    var nodes_far3 = infocontainer.find(".system .rares .far3");


    function updateFilters() {

        filter_showsuppressed = $("#showsuppressed").is(":checked");
        filter_shownoblackmarket = $("#shownoblackmarket").is(":checked");

        var iopt = $("input[name='illegal_option']:checked").attr("id");
        if(iopt == "illegal_option1") {
            filter_showillegal = "only";
        } else if(iopt == "illegal_option2") {
            filter_showillegal = false;
        } else if(iopt == "illegal_option3") {
            filter_showillegal = true;
        }

        var sdopt = $("input[name='sdistance_option']:checked").attr("id");
        if(sdopt == "sdistance_option1") {
            filter_sdistance = 1;
        } else if(sdopt == "sdistance_option2") {
            filter_sdistance = 2;
        } else if(sdopt == "sdistance_option3") {
            filter_sdistance = 3;
        } else if(sdopt == "sdistance_option4") {
            filter_sdistance = true;
        }


        nodes_all.show();

        if(!filter_shownoblackmarket) {
            nodes_noblackmarket.hide();
        }

        if(!filter_showsuppressed) {
            nodes_suppressed.hide();
        }

        if(filter_showillegal === "only") {
            nodes_notoftenillegal.hide();
        } else if(filter_showillegal === false) {
            nodes_oftenillegal.hide();
        }

        if(filter_sdistance === 1) {
            nodes_far1.hide();
        } else if(filter_sdistance === 2) {
            nodes_far2.hide();
        } else if(filter_sdistance === 3) {
            nodes_far3.hide();
        }


        filter(function(s) {

            if(!filter_showsuppressed && _.all(s.rares, function(r) { return r.suppressed; })) {
                return false;
            }

            if(!filter_shownoblackmarket && _.all(s.rares, function(r) { return r.station.has_blackmarket === 0; })) {
                return false;
            }

            if(filter_showillegal === false && _.all(s.rares, function(r) { return r.often_illegal; })) {
                return false;
            }

            if(filter_showillegal === "only" && _.all(s.rares, function(r) { return !r.often_illegal; })) {
                return false;
            }

            if(filter_sdistance === 1 && _.all(s.rares, function(r) { return r.station.distance_to_star > 1000; })) {
                return false;
            }

            if(filter_sdistance === 2 && _.all(s.rares, function(r) { return r.station.distance_to_star > 5000; })) {
                return false;
            }

            if(filter_sdistance === 3 && _.all(s.rares, function(r) { return r.station.distance_to_star > 100000; })) {
                return false;
            }

            return true;

        });




    }

    function filter(testfnc) {

        _.each(starobjs, function(s) {
            s.starObj.visible = !!testfnc(s.data);
        });

        placeGrid(true);
    }

    // --

    var resizetimeout = null;
    function resize() {

        if(resizetimeout != null) {
            clearTimeout(resizetimeout);
        }

        resizetimeout = setTimeout(function() {

            map_w = mapcontainer.width();
            map_h = mapcontainer.height();

            camera.aspect = map_w / map_h;
            camera.updateProjectionMatrix();

            renderer.setSize(map_w, map_h);

            $(".ui-autocomplete").css("max-height", window.innerHeight - $(".ui-autocomplete-input")[0].getBoundingClientRect().top - 40 + "px");

        }, 500);

    }

    function initTabs() {

        $("nav a").on("click", function(e) {

            var id = $(e.currentTarget).attr("id").replace("tab_", "");
            selectTab(id);

        });
    }


    function selectTab(id) {

        $("nav a").removeClass("active");
        $("nav a#tab_"+id).addClass("active");

        $("main>div").hide();
        $("main>div#"+id).show();

    }


    function initRenderer() {

        map_w = mapcontainer.width();
        map_h = mapcontainer.height();

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        devicePixelRatio = window.devicePixelRatio || 1;
        renderer.setPixelRatio(devicePixelRatio);
        renderer.setSize(map_w, map_h);

        mapnode = renderer.domElement;
        mapcontainer.append(mapnode);

    }

    function initScene() {

        scene = new THREE.Scene();

        // camera
        camera = new THREE.PerspectiveCamera(60, map_w / map_h, 0.1, 2000); // fieldOfView, aspectratio, near, far

        // controls
        controls = new THREE.OrbitStarmapControls(camera, mapnode);
        controls.enableZoom = true;
        controls.keyPanSpeed = 20;

        // Stats
        stats = new Stats();
        mapcontainer.append( stats.domElement );

        // Fog und BG
        scene.fog = new THREE.FogExp2( 0x000000, 0.0035 ); // color, density
        renderer.setClearColor( scene.fog.color, 1 );

    }

    function initObjects() {

        grid = new THREE.Object3D();

        var gridmeshsizets = gridmeshsize * sizefactor;

        var gridplanesize = 1000;
        var gridcolor = 0xcccccc;
        var gridcursorcolor = 0xffc66d;

        // Gridmaterials
        var gridMaterial = new THREE.MeshBasicMaterial( {
            color: gridcolor,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });
        var gridcursorMaterial = new THREE.MeshBasicMaterial( {
            color: gridcursorcolor,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        var gridLineMaterialThin = new THREE.LineBasicMaterial( {
            color: gridcolor,
            transparent: true,
            opacity: 0.4,
            linewidth: 1
        });
        var gridLineMaterial = new THREE.LineBasicMaterial( {
            color: gridcolor,
            transparent: true,
            opacity: 0.3,
            linewidth: 2
        });


        // Gridraster
        gridplane = new THREE.Object3D();
        var gridgeometry = new THREE.Geometry();
        gridgeometry.vertices.push(new THREE.Vector3( -gridplanesize/2, 0, 0 ) );
        gridgeometry.vertices.push(new THREE.Vector3( gridplanesize/2, 0, 0 ) );

        var line;
        for ( var i = 0; i <= gridplanesize/gridmeshsizets; i ++ ) {

            line = new THREE.Line( gridgeometry, gridLineMaterialThin );
            line.position.z = ( i * gridmeshsizets ) - gridplanesize/2;
            gridplane.add( line );

            line = new THREE.Line( gridgeometry, gridLineMaterialThin );
            line.position.x = ( i * gridmeshsizets ) - gridplanesize/2;
            line.rotation.y = 90 * Math.PI / 180;
            gridplane.add( line );

        }

        grid.add(gridplane);

        // ---- Stars ----
        var starRadius = 2;
        var starGeometry = new THREE.CircleGeometry( starRadius, 24 );

        var startextGeometry = new THREE.PlaneGeometry(32, 4);
        startextGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(19, -2, 0));


        _.each(window.stardata, function(star) {

            var xs = star.x * sizefactor;
            var ys = star.y * sizefactor;
            var zs = star.z * sizefactor;

            var starMaterial = new THREE.MeshBasicMaterial( {
                color: 0xf6110e,
                shading: THREE.FlatShading,
                fog: false
            });

            var starObj = new THREE.Object3D();

            // starcircle
            var starMesh = new THREE.Mesh( starGeometry, starMaterial );
            starObj.add( starMesh );

            // startext
            var startextcanvas = document.createElement("canvas");
            startextcanvas.width = 512;
            startextcanvas.height = 64;
            var startextctx = startextcanvas.getContext('2d');

            startextctx.textAlign = 'left';
            startextctx.textBaseline = 'top';
            startextctx.font = '45px Michroma';

            /* -- */
            //startextctx.fillStyle = "#ccc";
            //startextctx.fillRect(0,0,startextcanvas.width,startextcanvas.height);
            /* -- */

            startextctx.fillStyle = "#fff";
            startextctx.fillText(star.name, 0, 0);

            var startexttexture = new THREE.Texture(startextcanvas);
            startexttexture.needsUpdate = true;

            var startextMaterial = new THREE.MeshBasicMaterial( {
                map: startexttexture,
                transparent: true
            });

            var startextMesh = new THREE.Mesh( startextGeometry, startextMaterial );

            starObj.add(startextMesh);

            // starholder
            var h = Math.abs(ys) - starRadius - 0.5;


            var gridbasecircleGeometry = new THREE.CircleGeometry( 1, 32 );
            var gridbasecircleMesh = new THREE.Mesh( gridbasecircleGeometry, gridMaterial );
            gridbasecircleMesh.rotation.x = -90 * Math.PI / 180;

            gridbasecircleMesh.position.x = xs;
            gridbasecircleMesh.position.z = zs;

            grid.add(gridbasecircleMesh);


            var gridbaselineGeometry = new THREE.Geometry();

            gridbaselineGeometry.vertices.push(
                new THREE.Vector3(xs, 0, zs),
                new THREE.Vector3(xs, h * Math.sign(ys), zs)
            );


            var gridbaselineMesh = new THREE.Line(gridbaselineGeometry, gridLineMaterial);

            grid.add(gridbaselineMesh);

            // position starobj
            starObj.position.x = xs;
            starObj.position.y = ys;
            starObj.position.z = zs;

            scene.add(starObj);

            starobjs.push( {
                starObj: starObj,
                starMesh: starMesh,
                data: star,
                gridbasecircleMesh: gridbasecircleMesh,
                gridbaselineGeometry: gridbaselineGeometry,
                gridbaselineMesh: gridbaselineMesh
            });

            starMesh.dataIndex = starobjs.length - 1;
            starcirlcesforraycasting.push(starMesh);

        });


        // -- gridCursor ---

        // centercircle

        gridcursor = new THREE.Object3D();

        var gridcentercircleGeometry = new THREE.RingGeometry(2.2, 2.6, 24, 1);
        gridcentercircleGeometry.merge( new THREE.CircleGeometry( 0.5, 24 ) );

        var gridcentercircleMesh = new THREE.Mesh( gridcentercircleGeometry, gridcursorMaterial );
        gridcentercircleMesh.rotation.x = -90 * Math.PI / 180;

        gridcursor.add(gridcentercircleMesh);

        // coordstext

        var gridcoordscanvas = document.createElement("canvas");
        gridcoordscanvas.width = 1024;
        gridcoordscanvas.height = 64;
        gridcoordsctx = gridcoordscanvas.getContext('2d');

        gridcoordsctx.textAlign = 'left';
        gridcoordsctx.textBaseline = 'hanging';
        gridcoordsctx.font = 'bold 64px Michroma';

        //gridcoordsctx.fillStyle = "#ccc";
        //gridcoordsctx.fillRect(0,0,gridcoordscanvas.width,gridcoordscanvas.height);

        gridcoordsctx.fillStyle = intToRGB(gridcursorcolor);
        gridcoordsctx.fillText("( 0 / 0 / 0 )", 0, 0);

        //$("body").append(gridcoordscanvas);

        gridcoordstexture = new THREE.Texture(gridcoordscanvas);
        gridcoordstexture.needsUpdate = true;

        var gridcoordstextMaterial = new THREE.MeshBasicMaterial( {
            map: gridcoordstexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });

        var gridcoordstextGeometry = new THREE.PlaneGeometry(64, 4);

        var gridcoordstextMesh = new THREE.Mesh( gridcoordstextGeometry, gridcoordstextMaterial );

        gridcoordstextMesh.rotation.x = -90 * Math.PI / 180;
        gridcoordstextMesh.position.x = 35;
        gridcoordstextMesh.position.z = 9;

        gridcursor.add(gridcoordstextMesh);

        grid.add(gridcursor);
        scene.add(grid);

        placeGrid(true);

        // --



        // --

        raycaster = new THREE.Raycaster();

    }



    function initOtherStars() {

        var others = new THREE.Object3D();

        _.each(window.otherstars, function(star) {

            var xs = star.x * sizefactor;
            var ys = star.y * sizefactor;
            var zs = star.z * sizefactor;

            var otherMaterial = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                shading: THREE.FlatShading,
                fog: true
            });

            var otherGeometry = new THREE.SphereGeometry( 0.2, 5, 4 );
            var otherMesh = new THREE.Mesh(otherGeometry, otherMaterial);

            otherMesh.position.x = xs;
            otherMesh.position.y = ys;
            otherMesh.position.z = zs;

            others.add(otherMesh);

        });

        scene.add(others);

    }



    var oldgridy = 0;
    var gridmeshsizewc = gridmeshsize * sizefactor * 2; //precalcs
    var gridmeshsizewch = gridmeshsize * sizefactor; //precalcs
    function placeGrid(force) {

        var x = controls.target.x;
        var y = controls.target.y;
        var z = controls.target.z;


        if( y !== oldgridy || force === true ) {

            grid.position.y = y;

            // gridbaselines
            _.each(starobjs, function(s) {

                //todo: precalcs
                var ys = s.data.y * sizefactor;
                var h = Math.abs(ys - y) - 2.5;

                if (h > 1 &&
                    h < maxpilarsize * sizefactor &&
                    s.starObj.visible ) {

                    s.gridbaselineGeometry.vertices[1].y = h * Math.sign(ys - y);
                    s.gridbaselineGeometry.verticesNeedUpdate = true;

                    s.gridbasecircleMesh.visible = true;
                    s.gridbaselineMesh.visible = true;

                } else {

                    s.gridbasecircleMesh.visible = false;
                    s.gridbaselineMesh.visible = false;

                }

            });

            oldgridy = y;

        }


        if(Math.abs(gridplane.position.x - x) > gridmeshsizewc || Math.abs(gridplane.position.z - z) > gridmeshsizewc) {
            // Grid needs to snap to next position
            gridplane.position.x = Math.floor(x / gridmeshsizewch) * gridmeshsizewch;
            gridplane.position.z = Math.floor(z / gridmeshsizewch) * gridmeshsizewch;

        }

    }


    var ocux = 0, ocuy = 0, ocuz = 0;
    var ocuxt = 0, ocuyt = 0, ocuzt = 0;
    function placeCursor() {

        var x = controls.target.x;
        var y = controls.target.y;
        var z = controls.target.z;

        if( ocux !== x || ocuy !== y || ocuz !== z ) {

            gridcursor.position.x = x;
            gridcursor.position.z = z;

            ocux = x;
            ocuy = y;
            ocuz = z;

            // update coords
            var tol = 1; // tolerance for performance in world coords! not elite coords!
            if( x > ocuxt + tol ||
                x < ocuxt - tol ||
                y > ocuyt + tol ||
                y < ocuyt - tol ||
                z > ocuzt + tol ||
                z < ocuzt - tol) {

                gridcoordsctx.clearRect(0,0, 1024, 64);
                gridcoordsctx.fillText("( " + Math.round(x / sizefactor) + " / " + Math.round(y / sizefactor) + " / " + Math.round(z / sizefactor) + " )", 0, 0);
                gridcoordstexture.needsUpdate = true;

                ocuxt = x;
                ocuyt = y;
                ocuzt = z;
            }

        }

    }

    function setToStar(index) {

        var star = stardata[index];
        var x = star.x * sizefactor;
        var y = star.y * sizefactor;
        var z = star.z * sizefactor;

        controls.target.x = x;
        controls.target.y = y;
        controls.target.z = z;

        camera.position.x = x + standardcam_x;
        camera.position.y = y + standardcam_y;
        camera.position.z = z + standardcam_z;

    }

    var fromcontainer = $("#from", infocontainer);
    var tocontainer = $("#to", infocontainer);
    var travelbox = $("#travelbox", infocontainer);
    var travelbox_dist = $("#travelbox .lydistance", infocontainer);

    var fromdivs = fromcontainer.find(">div");
    var todivs = tocontainer.find(">div");

    function updateInfos() {
        var selected = -1, hovered = -1;

        if(selectedMesh) {
            selected = selectedMesh.dataIndex;
        }

        if(hoveredMesh) {
            hovered = hoveredMesh.dataIndex;
        }

        fromdivs.hide();
        todivs.hide();
        travelbox.hide();

        if(distlineMesh) {
            scene.remove(distlineMesh);
            distlineMesh = null;
        }


        if( selected >= 0 && hovered < 0) {
            // element selected, nothing hovered

            $("#to"+selected, tocontainer).show();

        } else if( selected < 0 && hovered >= 0) {
            // nothing selected, element hovered

            $("#to"+hovered, tocontainer).show().find("button").hide();

        } else if( selected >= 0 && hovered >= 0) {
            // something selected, something hovered

            if( selected == hovered ) {

                $("#to"+selected, tocontainer).show().find("button").show();

            } else {

                $("#from" + selected, fromcontainer).show();
                $("#to" + hovered, tocontainer).show().find("button").hide();
                travelbox.show();

                var d = calcDistance(selected, hovered);

                var col = colorBetween(rarecolorspectrum, d);
                travelbox.find(">div").css("color", col);

                travelbox_dist.html(d);
                drawConnectionLine(selected, hovered, RGBtoInt(col));

            }

        } else {
            // nothing selected or hovered


        }

    }


    function calcDistance(index1, index2) {

        var s1 = stardata[index1];
        var s2 = stardata[index2];

        return Math.sqrt( Math.pow(s2.x - s1.x, 2) + Math.pow(s2.y - s1.y, 2) + Math.pow(s2.z - s1.z, 2)).toFixed(1);

    }


    function drawConnectionLine(index1, index2, col) {

        var s1 = stardata[index1];
        var s2 = stardata[index2];

        var distlineGeometry = new THREE.Geometry();

        distlineGeometry.vertices.push(
            new THREE.Vector3(s1.x * sizefactor, s1.y * sizefactor, s1.z * sizefactor),
            new THREE.Vector3(s2.x * sizefactor, s2.y * sizefactor, s2.z * sizefactor)
        );

        var distlineMaterial = new THREE.LineBasicMaterial( {
            color: col,
            transparent: true,
            opacity: 0.3,
            linewidth: 3,
            fog: false
        });

        distlineMesh = new THREE.Line(distlineGeometry, distlineMaterial);

        scene.add(distlineMesh);
    }


    function colorByAllegiance() {

        var c = {
            "None": 0x646464,
            "Federation": 0xf90100,
            "Empire": 0x01a6fb,
            "Alliance": 0x00fb12,
            "Independent": 0x999999
        };

        _.each(starobjs, function(so) {
            so.starMesh.material.color.setHex(c[so.data.allegiance]);
        });

    }

    function colorByBlackmarket() {

        _.each(starobjs, function(so) {

            if(_.any(so.data.rares, function(r) { return r.station.has_blackmarket; })) {
                so.starMesh.material.color.setHex(0xbc3f3c);
            } else {
                so.starMesh.material.color.setHex(0x646464);
            }

        });

    }

    function colorByStationEconomy() {
        // takes only economy of first station (closest to star)

        var c = {
            "Extraction": 0xfc0000,
            "Refinery": 0xfd7f00,
            "Industrial": 0xfbfb02,
            "Agriculture": 0x80ff00,
            "Terraforming": 0x009800,
            "High Tech": 0x00fdfe,
            "Service": 0x0045fd,
            "Tourism": 0x6500e4,
            "Military": 0xe600e5
        };

        _.each(starobjs, function(so) {
            var eco = c[so.data.rares[0].station.economies[0]];
            if(!eco) { console.log(so.data.rares[0].station.economies[0]); }
            so.starMesh.material.color.setHex(eco);
        });

    }

    function colorByStationDistance() {
        // takes only economy of first station (closest to star)

        var p = [
            { val: 0, col: "#0f0" },
            { val: 1000, col: "#ff0" },
            { val: 100000, col: "#f00" }
        ];

        _.each(starobjs, function(so) {
            var d = so.data.rares[0].station.distance_to_star;
            so.starMesh.material.color.setHex(RGBtoInt(colorBetween(p, d)));
        });

    }


    var rarecolorspectrum = [
        { val: 0, col: "#800" },
        { val: 140, col: "#800" },
        { val: 170, col: "#0e0" },
        { val: 200, col: "#0ee" },
        { val: 220, col: "#338" }
    ];

    function colorByRareDistance() {

        _.each(starobjs, function(so, i) {

            var d = 0;

            if( selectedMesh ) {
                d = calcDistance(selectedMesh.dataIndex, i);
            }

            so.starMesh.material.color.setHex(RGBtoInt(colorBetween(rarecolorspectrum, d)));
        });

    }

    var percentagecolorspectrum = [
        { val: 0, col: "#e00" },
        { val: 1, col: "#0e0" }
    ];

    function colorByMinSupply() {

        _.each(starobjs, function(so, i) {

            var r = so.data.rares[0];

            if(r.supply_rate_min !== null) {

                var p = r.supply_rate_min / r.max_cap;

                so.starMesh.material.color.setHex(RGBtoInt(colorBetween(percentagecolorspectrum, p)));

            } else {

                so.starMesh.material.color.setHex(0x333333);

            }
        });

    }

    function colorByAvgSupply() {

        _.each(starobjs, function(so, i) {

            var r = so.data.rares[0];

            if(r.supply_rate_min !== null) {

                var p = ((r.supply_rate_max + r.supply_rate_min) / 2) / r.max_cap;

                so.starMesh.material.color.setHex(RGBtoInt(colorBetween(percentagecolorspectrum, p)));

            } else {

                so.starMesh.material.color.setHex(0x333333);

            }
        });

    }

    //precalc max and min
    var maxunitprice = _.max(stardata, function(s) { return s.rares[0].price; }).rares[0].price;
    var minunitprice = _.min(stardata, function(s) { return s.rares[0].price; }).rares[0].price;

    function colorByUnitPrice() {

        _.each(starobjs, function(so, i) {

            var up = [
                { val: minunitprice, col: "#444" },
                { val: (maxunitprice-minunitprice) / 3 + minunitprice, col: "#00a" },
                { val: maxunitprice, col: "#f0f" }
            ];

            so.starMesh.material.color.setHex(RGBtoInt(colorBetween(up, so.data.rares[0].price)));

        });

    }

    function colorBetween(p, val) {
        var u, o;

        if(val < p[0].val) {
            return p[0].col;
        }

        for( var i = 0; i < p.length; i++) {
            u = p[i];
            o = p[i+1];

            if(!o) {
                return u.col;
            }

            if(val >= u.val && val < o.val) {
                break;
            }
        }

        var uc = color_hex2rgb(u.col);
        var oc = color_hex2rgb(o.col);

        var a = (u.val - val) / (u.val - o.val);

        var r = ((oc.r - uc.r) * a) + uc.r;
        var g = ((oc.g - uc.g) * a) + uc.g;
        var b = ((oc.b - uc.b) * a) + uc.b;

        return color_rgb2hex({r:r,g:g,b:b});
    }

    function colorizingChange() {

        var v = colorizer.val();

        if( v == "allegiance") {
            colorByAllegiance();
        } else if( v == "blackmarket") {
            colorByBlackmarket();
        } else if( v == "stationeconomy" ) {
            colorByStationEconomy();
        } else if( v == "stationdistance" ) { // diabled atm
            colorByStationDistance();
        } else if( v == "rare" ) {
            colorByRareDistance();
        } else if( v == "minsupply") {
            colorByMinSupply();
        } else if( v == "avgsupply") {
            colorByAvgSupply();
        }else if( v == "unitprice") {
            colorByUnitPrice();
        }

        if(selectedMesh) {
            selectedOriginalColor = selectedMesh.material.color.getHex();
            selectedMesh.material.color.setHex(selectColor);
        }

        if(hoveredMesh) {
            hoveredOriginalColor = hoveredMesh.material.color.getHex();
            hoveredMesh.material.color.setHex(hoverColor);
        }

    }

    function intToRGB(i){
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "#" + "00000".substring(0, 6 - c.length) + c;
    }

    function RGBtoInt(c) {
        c = c.replace("#", "");

        if (c.length == 3) {
            c = c.substr(0,1) + c.substr(0,1) + c.substr(1,1) + c.substr(1,1) + c.substr(2,1) + c.substr(2,1);
        }

        return parseInt(c,16);
    }


    function color_hex2rgb(color) {
        var r, g, b;
        if (color.length == 4) {
            r = parseInt(color.replace("#", "").substr(0,1)+color.replace("#", "").substr(0,1),16) / 255;
            g = parseInt(color.replace("#", "").substr(1,1)+color.replace("#", "").substr(1,1),16) / 255;
            b = parseInt(color.replace("#", "").substr(2,1)+color.replace("#", "").substr(2,1),16) / 255;
        }
        if (color.length == 7) {
            r = parseInt(color.replace("#", "").substr(0,2),16) / 255;
            g = parseInt(color.replace("#", "").substr(2,2),16) / 255;
            b = parseInt(color.replace("#", "").substr(4,2),16) / 255;
        }

        if (r>=0 && r<=1 && g>=0 && g<=1 && b>=0 && b<=1) {
            return {r:r,g:g,b:b};
        } else {
            return {r:0,g:0,b:0};
        }
    }

    function color_rgb2hex(rgbobj) {
        var r = (typeof(rgbobj.r) != "undefined") ? rgbobj.r : 0;
        var g = (typeof(rgbobj.g) != "undefined") ? rgbobj.g : 0;
        var b = (typeof(rgbobj.b) != "undefined") ? rgbobj.b : 0;

        if(r > 1) { r = 1; }
        if(g > 1) { g = 1; }
        if(b > 1) { b = 1; }

        if(r < 0) { r = 0; }
        if(g < 0) { g = 0; }
        if(b < 0) { b = 0; }

        r = (Math.round(r * 255)).toString(16);
        g = (Math.round(g * 255)).toString(16);
        b = (Math.round(b * 255)).toString(16);

        if(r.length == 1) { r = "0" + r; }
        if(g.length == 1) { g = "0" + g; }
        if(b.length == 1) { b = "0" + b; }

        return "#" + r + g + b;
    }


    var routestorage = [];
    var route = [];
    var routelines;
    var sortableRoutelist;
    function addToRoute(rareid) {
        route.push(rareid);
        updateRouteSelection();
        updateRouteList();
        selectTab("route");
    }


    var raresbyid = null;
    function getRareById(uid) {

        if(raresbyid === null) {
            raresbyid = {};

            _.each(stardata, function(s, systemindex) {

                var system = _.clone(s);
                delete system.rares;

                _.each(s.rares, function(r) {

                    r.system = system;
                    r.systemindex = systemindex;
                    raresbyid[r.uid] = r;

                });

            });

        }

        return raresbyid[uid];
    }


    function updateRouteList() {

        var rc = $(".route_count");
        rc.html("("+route.length+")");

        if(route.length === 0) {
            rc.addClass("route_count_zero");
        } else {
            rc.removeClass("route_count_zero");
        }


        var list = $("#route").find("ul");
        list.empty();

        //remove old routelines
        if(routelines) {
            scene.remove(routelines);
        }

        routelines = new THREE.Object3D();

        var lastpos = null;
        _.each(route, function(uid, t) {

            var rare = getRareById(uid);

            var system = rare.system;

            var item = $("#cloneables").find(".routeitem").clone();

            $(".system", item).html(system.name);
            $(".rare_name", item).html(rare.name);
            $(".unitprice", item).html(rare.price);
            $(".station_name", item).html(rare.station.name);
            $(".station_distance", item).html(rare.station.distance_to_star);


            if(lastpos === null) {
                lastpos = getRareById(route[route.length-1]).systemindex;

                if(typeof(lastpos) == "undefined") {
                    lastpos = rare.systemindex;
                }
            }

            var d = calcDistance(lastpos, rare.systemindex);
            var col = colorBetween(rarecolorspectrum, d);

            $(".distancevalue", item).html(d);
            $(".arrow", item).css("color", col);
            item.attr("data-rareid", uid);


            list.append(item);

            // lines

            var routelineGeometry = new THREE.Geometry();
            var lp = stardata[lastpos];

            routelineGeometry.vertices.push(
                new THREE.Vector3(lp.x * sizefactor, lp.y * sizefactor, lp.z * sizefactor),
                new THREE.Vector3(system.x * sizefactor, system.y * sizefactor, system.z * sizefactor)
            );

            var routelineMaterial = new THREE.LineBasicMaterial( {
                color: RGBtoInt(col),
                transparent: true,
                opacity: 0.6,
                linewidth: 4,
                fog: false
            });

            var routelineMesh = new THREE.Line(routelineGeometry, routelineMaterial);

            routelines.add(routelineMesh);

            // --

            lastpos = rare.systemindex;

            // --

            $(".delrouteitem", item).button().on("click", function() {

                route.splice(t, 1);
                localStorage.route = JSON.stringify(route);
                updateRouteList();
                updateRouteSelection();

            });

        });


        scene.add(routelines);

        /* -- */

        if(!sortableRoutelist) {
            sortableRoutelist = list.sortable().on("sortstop", function() {

                route = sortableRoutelist.sortable('toArray', { attribute: 'data-rareid' });
                updateRouteList();

            });
        }


        /* -- */
        // Save to localstorage
        localStorage.route = JSON.stringify(route);

        /* -- */

        $("#saveroute").button("option", "disabled", !(route.length >= 1 && $("#savename").val() !== "" && getActRouteIndex() == -1 ));

        var actRouteIndex = getActRouteIndex();

        if(typeof(actRouteIndex) == "undefined" || actRouteIndex == -1) {
            $("#route h2").html("(unsaved)");
        } else {
            $("#route h2").html(routestorage[actRouteIndex].name);
        }


        /* -- */

        updateShareTextbox();
    }


    function updateShareTextbox() {

        if(route.length === 0) {

            $("#shareroute").val("");

        } else {

            var param = "http://" + document.location.host + "?r=" + route.join("_");

            var actRouteIndex = getActRouteIndex();
            if(typeof(actRouteIndex) != "undefined" && actRouteIndex != -1) {
                param += "&n="+ encodeURIComponent(routestorage[actRouteIndex].name);
            }

            $("#shareroute").val(param);

        }

    }


    function saveRouteStorage() {
        routestorage.push({name: $("#savename").val(), route: _.clone(route) });
        localStorage.routestorage = JSON.stringify(routestorage);

        $("#savename").val("");
        $("#saveroute").button("option", "disabled", true);

        updateRouteStorage();
        updateShareTextbox();
    }


    function updateRouteStorage() {

        var rl = $(".routelist");
        var cloneable = $("#cloneables .routelistitem");

        rl.empty();

        if(routestorage.length === 0) {
            rl.html("no saved routes");
        }


        _.each(routestorage, function(rsi, t) {

            var rli = cloneable.clone();

            $(".name", rli).html(rsi.name);

            var rarenames = [];
            _.each(rsi.route, function(uid) {

                var rare = getRareById(uid);
                rarenames.push(rare.name.replace(/\s/g, "&nbsp;"));
            });


            $(".details", rli).html(rarenames.join(" &raquo; "));


            rl.append(rli);

            rli.on("click", function() {

                route = _.clone(rsi.route);

                updateRouteSelection();
                updateRouteList();

            });

            $(".delroutelistitem", rli).button().on("click", function() {

                routestorage.splice(t, 1);
                localStorage.routestorage = JSON.stringify(routestorage);

                updateRouteStorage();
                updateRouteSelection();
                updateRouteList();

            });

        });

        updateRouteSelection();
    }


    function updateRouteSelection() {

        var items = $(".routelist .routelistitem");

        items.removeClass("active");

        var actRouteIndex = getActRouteIndex();

        if(typeof(actRouteIndex) != "undefined" && actRouteIndex != -1) {
            $(items[actRouteIndex]).addClass("active");
        }

        if(typeof(actRouteIndex) == "undefined" || actRouteIndex == -1) {
            $("#route h2").html("(unsaved)");
        } else {
            $("#route h2").html(routestorage[actRouteIndex].name);
        }

    }

    function getActRouteIndex() {

        var rr = route.join("#");
        return _.findIndex(routestorage, function(r) {

            return r.route.join("#") === rr;

        });

    }

    function initLocalLoading() {

        // Load from route
        if(typeof localStorage.route != "undefined" && localStorage.route != "") {
            route = JSON.parse(localStorage.route);
            updateRouteList();
        }


        if(typeof localStorage.routestorage != "undefined" && localStorage.routestorage != "") {
            routestorage = JSON.parse(localStorage.routestorage);
            updateRouteStorage();
        }

        updateShareTextbox();

        /* --- */

        // parameters override
        var ppairs = document.location.search.replace("?","").split("&");
        var p = {};
        _.each(ppairs, function(ppp) {
            p[ppp.split("=")[0]] = ppp.split("=")[1];
        });

        if(p.r) {

            if(!p.n) {
                p.n = "noname";
            }

            var oldname = _.find(routestorage, function (on) {
                return on.name == p.n;
            });

            if(!oldname || p.r != oldname.route.join("_")) {

                route = p.r.split("_");
                $("#savename").val(p.n);
                saveRouteStorage();
                updateRouteList();

            }

            //todo: nice camera location

        }

    }


}() );




/*

 {
    "name":"Gliese 1269",
    "x":-167.4375,
    "y":-132.375,
    "z":36.8125,
    "faction":"Jaque",
    "population":750,
    "government":"Cooperative",
    "allegiance":"Independent",
    "state":"None",
    "security":"Low",
    "primary_economy":"Tourism",
    "power":null,
    "power_state":null,
    "needs_permit":0,
    "rares":[{
        "name":"Jaques Queintian Still",
        "category":"Consumer Items",
        "price":8435,
        "max_cap":"18",
        "suppressed":false,
        "sc_est_mins":2,
        "often_illegal":false,
        "est_sell150":26997.75,
        "est_unit_profit150":18562.75,
        "est_total_profit150":334129.5,
        "station":{
            "name":"Jaques Station",
            "max_landing_pad_size":"L",
            "distance_to_star":85,
            "faction":"Jaque",
            "government":"Cooperative",
            "allegiance":"Independent",
            "state":"None",
            "type_id":7,
            "type":"Ocellus Starport",
            "has_blackmarket":1,
            "has_market":1,
            "has_refuel":1,
            "has_repair":1,
            "has_rearm":1,
            "has_outfitting":1,
            "has_shipyard":0,
            "has_commodities":1,
            "import_commodities":[
                "Beer",
                "Gold",
                "Silver"
            ],
            "export_commodities":[
                "Hydrogen Fuel",
                "Biowaste",
                "Limpet"
            ],
            "prohibited_commodities":[
                "Narcotics",
                "Combat Stabilisers",
                "Imperial Slaves",
                "Slaves",
                "Battle Weapons",
                "Toxic Waste",
                "Trinkets Of Hidden Fortune"
            ],
            "economies":["Tourism"],
            "is_planetary":0
            }
            }
            ]
            }
 
 */