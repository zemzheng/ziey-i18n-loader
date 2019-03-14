require("should");
const assert = require('assert');
const qs = require('querystring');
var path = require( 'path' );
var myLoader = require( '../index.js' );

var runLoader = function( content ){
    return myLoader.call( context, content );
}

function getQuery( lang, others){
    const _path = /^lang/.test( lang ) ? path.join( __dirname, 'lang.po' ) : '';
    const options = { ...others, lang, path: _path };
    return qs.stringify(options);
}

function run(resourcePath, query, content) {
	var context = {
            addDependency : function(){},
            resourcePath: resourcePath,
            query: "?" + query,
        };
	return myLoader.call( context, content );
}

function test(excepted, resourcePath, lang, content, otherOptions = {}) {
	run(resourcePath, getQuery( lang, otherOptions ), content).should.be.eql(excepted);
}

describe( 'ziey-i18n-loader', function(){
    it( '翻译文本', function(){
        var lang = 'lang';
        test( 'Release online', 'test.js', lang, '{# 现网更新 #}' );
        test( "He\'s our editor", 'test.js', lang, '{# 他是我们的编辑人员 #}' );
        test( 'Click to see \"More\"', 'test.js', lang, '{# 点击查看更多 #}' );
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
    it( '默认删除不用的词条', function(){
        var lang = 'lang3';
        test( 'Release online', 'test.js', lang, '{# 现网更新 #}' );
        var output = myLoader.output( 'po' );
        assert( output.lang.lang3.indexOf('他是我们的编辑人员') === -1 );
    } );
    it( '如果指定不删除，应该保留词条', function(){
        var lang = 'lang4';
        test( 'Release online', 'test.js', lang, '{# 现网更新 #}', {clean: 0} );
        var output = myLoader.output( 'po' );
        assert( output.lang.lang4.indexOf('他是我们的编辑人员') !== -1 );
    } );
    it( '支持json转码', function(){
        var lang = 'lang6';
        test( "He's our editor", 'test.js', lang, '{# json# 他是我们的编辑人员 #}' );
        test( 'Click to see \\\"More\\\"', 'test.js', lang, '{# JSON# 点击查看更多 #}' );
    } );
    it( '支持自定义的标签', function(){
        var lang = 'lang5';
        test( 'Release online', 'test.js', lang, '<< 现网更新 }}', {clean: 0, openTag: '<<', closeTag: '}}'} );
        var output = myLoader.output( 'po' );
        assert( output.lang.lang4.indexOf('他是我们的编辑人员') !== -1 );
    } );
} );

