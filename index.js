/**
 * @author zemzheng
 * @see http://webpack.github.io/docs/loaders.html#writing-a-loader
 */

var fs = require( 'fs' ),
    path = require( 'path' ),
    gettext = require( 'ziey-gettext' );
var loaderUtils = require("loader-utils");

var gettext_recored = { path : {}, lang : {} };

module.exports = function(content) {

    this.cacheable && this.cacheable();

    var query = loaderUtils.parseQuery(this.query);
    query.lang = query.lang || 'lang';
    
    if( !gettext_recored[ query.path ] ){
        if( query.path && fs.existsSync( query.path ) ){
            switch( true ){
                case !gettext_recored.lang[ query.lang ]:
                    // 完全没有记录
                    gettext_recored.path[ query.path ] = query.lang;
                    gettext_recored.lang[ query.lang ] = query.path;
                    gettext.handlePo( query.lang, query.path );

                    // 添加依赖
                    this.addDependency( query.path );

                    // 清理原有的来源列表
                    gettext.setLang( query.lang );
                    gettext.cleanCurrentDictReference();
                    break;

                case gettext_recored.path[ query.path ] == query.lang
                        && gettext_recored.lang[ query.lang ] == query.path:
                    // 与之前记录重合
                    break;

                default:
                    console.error({
                        input : query,
                        but   : {
                            lang : gettext_recored.path[ query.path ],
                            path : gettext_recored.lang[ query.lang ]
                        }
                    })
                    throw new Error( 'have re-name po path + lang' );
            }

        } else {
            gettext.handlePoTxt( query.lang, '' );
        }
    }

    gettext.setLang( query.lang );

    var reg = /{#(.+?)#}/g,
        dict = gettext.getDictByLang( query.lang );

    var reference = path.relative(
            path.dirname( query.path ),
            this.resourcePath
        );
    return content.replace( reg, function( str , str_inner ){
        str_inner = str_inner
            .replace( /(^\s*|\s*$)/g, '' )
            // .replace( /^=\s*\_\(\s*\\{0,1}['"](.+?)\\{0,1}['"]\s*\)/g, '$1' )
        if( !( str_inner in dict ) ) dict[ str_inner ] = '';
        var result = gettext._( str_inner ).replace( /(["'])/g, '\\$1' );
        gettext.updateCurrentDict( str_inner, { reference : reference } );
        return result;
    } );
};


module.exports.output = function( format_po ){
    format_po = format_po == 'po' ? true : false;
    var p, lang, obj, result = { path : {}, lang : {} };
    for( lang in gettext_recored.lang ){
        p = gettext_recored.lang[ lang ];
        obj = gettext.getDictByLang( lang );
        result.path[ p ] = result.lang[ lang ] = format_po ? gettext.obj2po( obj ) : obj;
    }
    return result;
};
module.exports.save = function(){
    var files = module.exports.output( 'po' ).path;
    var f;
    for( f in files ){
        fs.writeFileSync( f, files[ f ] );
    }
};
