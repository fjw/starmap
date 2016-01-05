<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>starmap</title>

    <style>
        @font-face {
            font-family: 'Michroma';
            font-style: normal;
            font-weight: 400;
            src: local('Michroma'),
            url('fonts/michroma-v7-latin-regular.woff2') format('woff2'),
            url('fonts/michroma-v7-latin-regular.woff') format('woff');
        }
    </style>

    <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>



    <header>
        <h1>eliterares.toolset.io</h1>
        <div class="by">by Frédéric Worm</div>

        <div class="about">
            <a href="#" class="coffeelink">

                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="38px" height="38px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                    <path d="M383.1,257.4c0.6-5.4,0.9-10,0.9-13.8c0-19.6-3.3-19.7-16-19.7h-75.5c7.3-12,11.5-24.4,11.5-37c0-37.9-57.3-56.4-57.3-88  c0-11.7,5.1-21.3,9.3-34.9c-26.5,7-47.4,33.5-47.4,61.6c0,48.3,56.3,48.7,56.3,84.8c0,4.5-1.4,8.5-2.1,13.5h-55.9  c0.8-3,1.3-6.2,1.3-9.3c0-22.8-39.1-33.9-39.1-52.8c0-7,1-12.8,3.2-21c-12.9,5.1-28.3,20-28.3,36.8c0,26.7,31.9,29.3,36.8,46.3H80  c-12.7,0-16,0.1-16,19.7c0,19.6,7.7,61.3,28.3,111c20.6,49.7,44.4,71.6,61.2,86.2l0.1-0.2c5.1,4.6,11.8,7.3,19.2,7.3h102.4  c7.4,0,14.1-2.7,19.2-7.3l0.1,0.2c9-7.8,20-17.8,31.4-32.9c4.7,2,9.8,3.7,15.4,5c8.4,2,16.8,3,24.8,3c24,0,45.6-9.2,60.8-25.8  c13.4-14.6,21.1-34.4,21.1-54.2C448,297,420,264.5,383.1,257.4z M366.1,384.2c-8.6,0-15.6-1.2-22.1-4.2c4-8,7.9-15.9,11.7-25.1  c10.1-24.4,17.1-47,21.6-65.8c22,4.3,38.7,23.8,38.7,47.1C416,358.9,398.8,384.2,366.1,384.2z" fill="#fff"/>
                </svg>
                <span>If you like it,<br> you could buy me a coffee!</span>

            </a>
        </div>

    </header>
    <main>
        <nav>
            <a id="tab_info">Info</a>
            <a id="tab_route">Route <span class="route_count route_count_zero">(0)</span></a>
            <a id="tab_help"  class="active">Help/About</a>
        </nav>

        <!-- ------------------------------------------------- -->

        <div id="help" class="">

            <h2>Controls</h2>

            <h3>Mouse Left - Drag</h3>
            <p>Turn around current position.</p>

            <h3>Mouse Right - Drag</h3>
            <p>Pan on x/z - plane.</p>

            <h3>Mouse Middle - Drag</h3>
            <p>Pan in y-direction.</p>

            <h3>Mouse Wheel</h3>
            <p>Zoom Zoom Zoom.</p>

            <h3>Mouse Left - Click</h3>
            <p>Select star.</p>

            <h3>Mouse Left - Doubleclick</h3>
            <p>Move to star.</p>

            <h2>Sourcecode</h2>
            <p>The sourcecode is freely available on github (MIT-License): <a href="https://github.com/fjw/starmap">fjw/starmap</a>.</p>

            <h2>Data</h2>
            <p>The list of rares comes from the Elite Dangerous Wiki <a href="http://elite-dangerous.wikia.com/wiki/List_of_Rare_Commodities">rares list</a> with a lot of manual corrections and research by myself.</p>
            <p>All additional Information about the Stations and Systems comes from <a href="https://eddb.io/api">EDDB API</a>. Thanks!</p>
            <p>The last data-import was: {{datatime}}</p>

            <h2>About me</h2>
            <p>In Elite Dangerous I am CMDR Pertel.</p>
            <p>In real life I am a eCommerce-Developer living in beautiful Munich / Germany. You can find out more about me and my projects on my <a href="https://github.com/fjw?tab=repositories">github</a> and my <a href="https://www.xing.com/profile/Frederic_Worm">xing</a> profile.</p>
            <p>If you would like to support my stuff, a warm <a href="#" class="coffeelink">coffee</a> is always helpful. :)</p>

            <h2>Contact</h2>
            <p>If you got problems or have suggetions you can write me: fjw@garx.de</p>

        </div>

        <!-- ------------------------------------------------- -->

        <div id="info" class="nn">

            <div id="from">

                {{from}}

            </div>

            <div id="travelbox" class="nn">
                <div class="arrow1">&darr;</div>
                <span class="lydistance"></span> Ly
                <div class="arrow2">&darr;</div>
            </div>

            <div id="to">

                {{to}}

            </div>

        </div>

        <!-- ------------------------------------------------- -->

        <div id="route" class="nn">
            <ul></ul>
            <div class="small_info">drag to change order</div>
        </div>

        <!-- ------------------------------------------------- -->

    </main>
    <div id="maparea">

        <div id="filters">

            <div class="filter">
                <div class="label">Search:</div>
                <input type="text" id="search">
            </div>

            <div class="filter">

                <div class="label">Color by:</div>
                <select name="color" id="color">
                    <option value="rare" selected="selected">optimal distance from selected</option>
                    <option value="allegiance">allegiance of system</option>
                    <option value="stationdistance">station distance from star</option>
                    <option value="stationeconomy">economy of station</option>
                    <option value="blackmarket">has blackmarket</option>
                </select>

            </div>

            <div class="filter">

                <div class="label">Show FPS:</div>
                <input type="checkbox" id="showfps">

            </div>

        </div>

        <div id="map"></div>
    </div>
    <footer>

    </footer>

    <div id="donateform" class="nn">

        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick">
            <input type="hidden" name="hosted_button_id" value="LEPGB578QGGYA">
            <input type="image" src="" border="0" name="submit" alt="PayPal — The safer, easier way to pay online.">
            <img alt="" border="0" src="https://www.paypalobjects.com/de_DE/i/scr/pixel.gif" width="1" height="1">
        </form>

    </div>


    <div id="cloneables" class="nn">

        <ul>
            <li class="routeitem">

                <button class="delrouteitem">&times;</button>

                <div>
                    <div class="distance"><span class="distancevalue"></span> Ly <span class="arrow">&rarr;</span></div>
                    <div class="system"></div>
                </div>

                <div class="rare"></div>

                <div>
                    <div class="station"></div>
                    <div class="lsdistance"></div>
                </div>

                <div></div>
            </li>
        </ul>

    </div>



    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-33672180-4', 'auto');
        ga('send', 'pageview');
    </script>


    <script type="text/javascript">
        window.stardata = JSON.parse('{{stardata}}');
    </script>
    <script src="script.js"></script>
</body>
</html>