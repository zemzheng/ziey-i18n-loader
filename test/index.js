require("should");
var path = require( 'path' );
var myLoader = require( '../index.js' );
var context = { 
        request : '',
        loaderIndex : 0,
        options : {
            module : {
                loaders : [
                    {
                        options : {
                            lang : 'lang',
                            path : path.join( __dirname, 'lang.po' ),
                            openTag  : '{#',
                            closeTag : '#}'
                        }
                    }
                ]
            } 
        }
    };
var runLoader = function( content ){
    return myLoader.call( context, content );
}
describe( 'ziey-i18n-loader', function(){
    it( '翻译文本，注意单双引号前面加上转义符', function(){
        runLoader( '{# 现网更新 #}' ).should.equal( 'Release online' );
        runLoader( '{# 他是我们的编辑人员 #}' ).should.equal( "He\\'s our editor" );
        runLoader( '{# 点击查看更多 #}' ).should.equal( "Click to see \\\"More\\\"" );
    } );
} );
