require("should");
var path = require( 'path' );
var myLoader = require( '../index.js' );

var runLoader = function( content ){
    return myLoader.call( context, content );
}

function getQuery( lang ){
    return [
        'lang=' + encodeURIComponent( lang ),
        'path=' + ( /^lang/.test( lang ) ? encodeURIComponent( path.join( __dirname, 'lang.po' ) ) : '' )
    ].join( '&' );
}

function run(resourcePath, query, content) {
	var context = {
            addDependency : function(){},
            resourcePath: resourcePath,
            query: "?" + query,
        };
	return myLoader.call( context, content );
}

function test(excepted, resourcePath, lang, content) {
	run(resourcePath, getQuery( lang ), content).should.be.eql(excepted);
}

describe( 'ziey-i18n-loader', function(){
    it( '翻译文本', function(){
        var lang = 'lang';
        test( 'Release online', 'test.js', lang, '{# 现网更新 #}' );
        test( "He\\'s our editor", 'test.js', lang, '{# 他是我们的编辑人员 #}' );
        test( "Click to see \\\"More\\\"", 'test.js', lang, '{# 点击查看更多 #}' );
    } );

    it( '没有输入po时候返回默认内容', function(){
        var lang = 'nothing';
        test( 'Release online', 'test.js', lang, 'Release online' );
        test( "他是我们的编辑人员", 'test.js', lang, '{# 他是我们的编辑人员 #}' );
    } );

    it( '同个po文件不同lang名字', function(){
        var lang = 'lang1';
        test( 'Release online', 'test.js', lang, '{# 现网更新 #}' );
        var lang = 'lang2';
        test( 'Release online', 'test.js', lang, '{# 现网更新 #}' );
        var output = myLoader.output( 'po' );
        output.lang.lang1.should.be.eql( output.lang.lang2 );
    } );

} );

