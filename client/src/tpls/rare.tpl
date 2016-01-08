<div class="rare
        {{noblackmarket_start}} noblackmarket{{noblackmarket_end}}
        {{suppressed_start}} suppressed{{suppressed_end}}
        {{oftenillegal_start}} oftenillegal{{oftenillegal_end}}
        {{notoftenillegal_start}} notoftenillegal{{notoftenillegal_end}}
        {{far1_start}} far1{{far1_end}}
        {{far2_start}} far2{{far2_end}}
        {{far3_start}} far3{{far3_end}}
        ">


    <div class="raresummary_box">
        <div><span class="rare_name">{{name}}</span></div>
        <div><span class="unitprice">{{price}} cr/t</span></div>
        <div><span class="station_name">{{station_name}}</span> - <span class="station_distance">{{distance}}</span> Ls</div>

        <div class="tonnes_container">
            <div class="max">{{max}}</div>
            <div class="tonnes">
                {{tonnes}}
            </div>
            <div class="supply">{{supply}}</div>
        </div>
    </div>


    <p class="station_infos">
        <span class="station_faction">{{faction}}</span>
    </p>
    <p class="station_infos">
        <span class="station_allegiance">{{allegiance}}</span> / <span class="station_government">{{government}}</span> / <span class="station_economies">{{economies}}</span><br>
        <span class="station_type">{{type}}</span>, max pad: <span class="station_padsize">{{padsize}}</span>
    </p>
    <p class="station_facilites">
        {{blackmarket_start}}<span class="blackmarket">Blackmarket</span><br>{{blackmarket_end}}
        {{market_start}}Commodities<br>{{market_end}}
        {{refuel_start}}Refuel<br>{{refuel_end}}
        {{repair_start}}Repair<br>{{repair_end}}
        {{rearm_start}}Rearm<br>{{rearm_end}}
        {{outfitting_start}}Outfitting<br>{{outfitting_end}}
        {{shipyard_start}}Shipyard<br>{{shipyard_end}}
    </p>

    <button class="addtoroute" data-id="{{rareid}}"><span class="plus">+</span>add to route</button>
</div>