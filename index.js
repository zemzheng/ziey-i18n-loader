/**
 * @author zemzheng
 * @see http://webpack.github.io/docs/loaders.html#writing-a-loader
 */

var fs = require( 'fs' ),
    path = require( 'path' ),
    gettext = require( 'ziey-gettext' );

var gettext_recored = {};

module.exports = function(content) {
    //
    // {
    //     test   : /\.(js|html)$/i, 
    //     loader : "ziey-i18n",
    //     include : new RegExp( 'app' + '\\' + path.sep + 'scripts' ),
    //     options : {
    //         openTag  : '{#',
    //         closeTag : '#}',
    //         lang     : lang,
    //         path     : path.join( __dirname, lang_root, lang + '.po' ),
    //         clean_po : 1
    //     }
    // },
    var opts = this.options.module.loaders[ this.loaderIndex ].options || {};

    if( !gettext_recored[ opts.path ] ){
        gettext_recored[ opts.path ] = opts.lang;
        gettext.handlePo( opts.lang, opts.path );
    }

    gettext.setLang( opts.lang );

    var reg = new RegExp( opts.openTag + '(.+?)' + opts.closeTag, 'g' ),
        dict = gettext.getDictByLang( opts.lang );

    var reference = path.relative(
            path.dirname( opts.path ),
            this.request.replace( /^.*\!/, '' )
        );
    return content.replace( reg, function( str , str_inner ){
        str_inner = str_inner
            .replace( /(^\s*|\s*$)/g, '' )
            .replace( /^=\s*\_\(\s*\\{0,1}['"](.+?)\\{0,1}['"]\s*\)/g, '$1' )
        if( !( str_inner in dict ) ) dict[ str_inner ] = '';
        var result = gettext._( str_inner ).replace( /(["'])/g, '\\$1' );
        gettext.updateCurrentDict( str_inner, { reference : reference } );
        return result;
    } );
};

module.exports.save = function(){
    var p, lang;
    for( p in gettext_recored ){
        lang = gettext_recored[ p ];
        fs.writeFileSync(
            p,
            gettext.obj2po( gettext.getDictByLang( lang ) )
        );
    }
}

