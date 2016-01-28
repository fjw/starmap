<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>eliterares - Elite Dangerous 3D map for rares trading</title>

    <style>
        @font-face {
            font-family: 'Michroma';
            font-style: normal;
            font-weight: 400;
            src: local('Michroma'),
            url('fonts/michroma-v7-latin-regular.woff2') format('woff2'),
            url('fonts/michroma-v7-latin-regular.woff') format('woff');
        }

        @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 400;
            src: local('Source Sans Pro'),
            url('fonts/Source-Sans-Pro-regular.woff2') format('woff2'),
            url('fonts/Source-Sans-Pro-regular.woff') format('woff');
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

                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="32px" height="32px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                    <path d="M383.1,257.4c0.6-5.4,0.9-10,0.9-13.8c0-19.6-3.3-19.7-16-19.7h-75.5c7.3-12,11.5-24.4,11.5-37c0-37.9-57.3-56.4-57.3-88  c0-11.7,5.1-21.3,9.3-34.9c-26.5,7-47.4,33.5-47.4,61.6c0,48.3,56.3,48.7,56.3,84.8c0,4.5-1.4,8.5-2.1,13.5h-55.9  c0.8-3,1.3-6.2,1.3-9.3c0-22.8-39.1-33.9-39.1-52.8c0-7,1-12.8,3.2-21c-12.9,5.1-28.3,20-28.3,36.8c0,26.7,31.9,29.3,36.8,46.3H80  c-12.7,0-16,0.1-16,19.7c0,19.6,7.7,61.3,28.3,111c20.6,49.7,44.4,71.6,61.2,86.2l0.1-0.2c5.1,4.6,11.8,7.3,19.2,7.3h102.4  c7.4,0,14.1-2.7,19.2-7.3l0.1,0.2c9-7.8,20-17.8,31.4-32.9c4.7,2,9.8,3.7,15.4,5c8.4,2,16.8,3,24.8,3c24,0,45.6-9.2,60.8-25.8  c13.4-14.6,21.1-34.4,21.1-54.2C448,297,420,264.5,383.1,257.4z M366.1,384.2c-8.6,0-15.6-1.2-22.1-4.2c4-8,7.9-15.9,11.7-25.1  c10.1-24.4,17.1-47,21.6-65.8c22,4.3,38.7,23.8,38.7,47.1C416,358.9,398.8,384.2,366.1,384.2z" fill="#fff"/>
                </svg>
                <span>Want to support this? Buy me a coffee!</span>

            </a>
        </div>

    </header>
    <main>
        <nav>
            <div>
                <a id="tab_info">Info</a>
                <a id="tab_route">Route&nbsp;<span class="route_count route_count_zero">(0)</span></a>
                <a id="tab_loadsave">Load/Save</a>
            </div>
            <div>
                <a id="tab_filters">Filters/Settings</a>
                <a id="tab_help"  class="active">Help/About</a>
            </div>
        </nav>

        <!-- ------------------------------------------------- -->

        <div id="help" class="">

            <div class="section">
                <h2>Controls</h2>

                <div class="inner">
                    <p><b>Mouse Left - Drag</b><br>Turn around current position.</p>
                    <p><b>Mouse Right - Drag or W-A-S-D&nbsp;Keys</b><br>Pan on x/z - plane.</p>
                    <p><b>Mouse Middle - Drag or R-F&nbsp;Keys</b><br>Pan in y-direction.</p>
                    <p><b>Mouse Wheel</b><br>Zoom Zoom Zoom.</p>
                    <p><b>Mouse Left - Click</b><br>Select star.</p>
                    <p><b>Mouse Left - Doubleclick</b><br>Move to star.</p>
                </div>
            </div>

            <div class="section">
                <h2>Sourcecode</h2>
                <div class="inner">
                    <p>The sourcecode is freely available on github (MIT-License): <a href="https://github.com/fjw/starmap">fjw/starmap</a>.</p>
                </div>

                <h2>Data</h2>
                <div class="inner">
                    <p>The list of rares comes from the Elite Dangerous Forum <a href="https://forums.frontier.co.uk/showthread.php?t=63119&page=171">rares list</a>. Thanks to all the Forum users for this.</p>
                    <p>All additional Information about the Stations and Systems comes from <a href="https://eddb.io/api">EDDB API</a>. Thanks!</p>
                    <p>The last data-import was: {{datatime}}</p>
                </div>

                <h2>About me</h2>
                <div class="inner">
                    <p>In Elite Dangerous I am CMDR Pertel.</p>
                    <p>In real life I am a eCommerce developer living in beautiful Munich / Germany. You can find out more about me and my projects on <a href="https://github.com/fjw?tab=repositories">github</a> and my <a href="https://www.xing.com/profile/Frederic_Worm">xing</a> profile.</p>
                    <p>If you would like to support my stuff, a warm <a href="#" class="coffeelink">coffee</a> is always helpful. :)</p>
                </div>

                <h2>Contact</h2>
                <div class="inner">
                    <p>If you got problems, suggestions or feature requests it is best to write me in the <a href="https://forums.frontier.co.uk/showthread.php?t=221171">forum thread</a> of this tool.
                        If it's about something different, mail me: fjw@garx.de</p>
                </div>
            </div>
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
            <h2>(unsaved)</h2>
            <ul></ul>
            <div class="small_info">drag to change order</div>
        </div>

        <!-- ------------------------------------------------- -->

        <div id="loadsave" class="nn">

            <div class="section">
                <p>Save current route:</p>
                <button id="saveroute">Save</button>
                <div class="textbox">
                    <input type="text" id="savename" placeholder="Name">
                </div>
            </div>

            <div class="section">
                <p>Share link for current route:</p>
                <input type="text" id="shareroute">
            </div>

            <div class="section">

                <h2>Saved routes</h2>

                <div class="routelist"></div>

            </div>

        </div>

        <!-- ------------------------------------------------- -->

        <div id="filters" class="nn">

            <div class="section">

                <div class="filter">
                    <div class="label">Search for<br>Systems or Rares:</div>
                    <div class="inputcontainer">
                        <input type="text" id="search">
                    </div>
                </div>

            </div>

            <div class="section">

                <div class="filter">
                    <div class="label">Color by:</div>
                    <select name="color" id="color">
                        <option value="rare" selected="selected">optimal distance from selected</option>
                        <option value="allegiance">allegiance of system</option>
                        <option value="stationeconomy">economy of station</option>
                        <option value="blackmarket">station has blackmarket</option>
                        <option value="minsupply">percentage of min supply rate</option>
                        <option value="avgsupply">percentage of avg supply rate</option>
                        <option value="unitprice">unit price</option>
                    </select>
                </div>

                <div class="filter">
                    <div class="label">Suppressed goods:</div>
                    <div class="toggle_checkbox">
                        <input type="checkbox" id="showsuppressed" checked>
                        <label for="showsuppressed">
                            <div class="toggle_checkbox_off">hide</div>
                            <div class="toggle_checkbox_on">show</div>
                            <div class="toggle_checkbox_slider"></div>
                        </label>
                    </div>
                </div>

                <div class="filter">
                    <div class="label forcheckbox">Stations without blackmarket:</div>
                    <div class="toggle_checkbox">
                        <input type="checkbox" id="shownoblackmarket" checked>
                        <label for="shownoblackmarket">
                            <div class="toggle_checkbox_off">hide</div>
                            <div class="toggle_checkbox_on">show</div>
                            <div class="toggle_checkbox_slider"></div>
                        </label>
                    </div>
                </div>

                <div class="filter">
                    <div class="label">Often illegal goods:</div>
                    <div class="toggle_radio3">
                        <input type="radio" class="toggle_option1" id="illegal_option1" name="illegal_option">
                        <input type="radio" class="toggle_option2" id="illegal_option2" name="illegal_option">
                        <input type="radio" class="toggle_option3" id="illegal_option3" name="illegal_option" checked>

                        <label for="illegal_option1">only</label>
                        <label for="illegal_option2">hide</label>
                        <label for="illegal_option3">show</label>

                        <div class="toggle_option_slider"></div>
                    </div>
                </div>

                <div class="filter fulllength">
                    <div class="label">Show only stations within distance:</div>

                    <div class="toggle_radio4">
                        <input type="radio" class="toggle_option1" id="sdistance_option1" name="sdistance_option">
                        <input type="radio" class="toggle_option2" id="sdistance_option2" name="sdistance_option">
                        <input type="radio" class="toggle_option3" id="sdistance_option3" name="sdistance_option">
                        <input type="radio" class="toggle_option4" id="sdistance_option4" name="sdistance_option" checked>

                        <label for="sdistance_option1">&lt; 1&#8202;000 Ls</label>
                        <label for="sdistance_option2">&lt; 5&#8202;000 Ls</label>
                        <label for="sdistance_option3">&lt; 100&#8202;000 Ls</label>
                        <label for="sdistance_option4">All</label>

                        <div class="toggle_option_slider"></div>
                    </div>

                </div>

            </div>

            <div class="section">
                <div class="filter">
                    <div class="label forcheckbox">FPS-Graph:</div>
                    <div class="toggle_checkbox">
                        <input type="checkbox" id="showfps">
                        <label for="showfps">
                            <div class="toggle_checkbox_off">disabled</div>
                            <div class="toggle_checkbox_on">enabled</div>
                            <div class="toggle_checkbox_slider"></div>
                        </label>
                    </div>
                </div>
            </div>

        </div>

        <!-- ------------------------------------------------- -->

    </main>
    <div id="maparea">
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

                <div class="raresummary_box">
                    <div><span class="rare_name"></span></div>
                    <div><span class="unitprice"></span> cr/t</div>
                    <div><span class="station_name"></span> - <span class="station_distance"></span> Ls</div>
                </div>

                <div></div>
            </li>
        </ul>


        <div class="routelistitem">
            <div class="name"></div>
            <div class="details"></div>

            <button class="delroutelistitem">&times;</button>
        </div>


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