

$(document).ready(function() {

    if(window.buildnr) {

        var $title = $("title");

        $title.html($title.html() + " " + buildnr);

        setInterval(function() {

            $.ajax({
                url: "/getbuildnr"
            }).done(function(data) {

                if( parseInt(data) > window.buildnr ) {
                    location.reload(true);
                }
            });

        }, 1000);

    }

});