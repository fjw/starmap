$.widget( "custom.catcomplete", $.ui.autocomplete, {
    _create: function() {
        this._super();
        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
    },
    _renderMenu: function( ul, items ) {
        var that = this;

        $.each( items, function( index, item ) {
            var li;

            li = that._renderItemData( ul, item );
            if ( item.category ) {
                li.addClass("cat_"+item.category);
                li.attr( "aria-label", item.category + " : " + item.label );
            }
        });
    }
});