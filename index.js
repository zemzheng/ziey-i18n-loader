/**
 * @author zemzheng
 * @see http://webpack.github.io/docs/loaders.html#writing-a-loader
 */

var fs = require('fs'),
    path = require('path'),
    gettext = require('ziey-gettext');
var loaderUtils = require("loader-utils");

var gettext_recored = { path: {}, lang: {}, clean: 1, openTag: '{#', closeTag: '#}' };

module.exports = function (content) {

    this.cacheable && this.cacheable();

    var query = loaderUtils.parseQuery(this.query);
    query.lang = query.lang || 'lang';

    if (!gettext_recored[ query.path ]) {
        if (query.path && fs.existsSync(query.path)) {
            switch (true) {
                case !gettext_recored.lang[ query.lang ]:
                    // 完全没有记录
                    gettext_recored.path[ query.path ] = query.lang;
                    gettext_recored.lang[ query.lang ] = query.path;
                    gettext_recored.openTag = query.openTag || gettext_recored.openTag;
                    gettext_recored.closeTag = query.closeTag || gettext_recored.closeTag;
                    gettext_recored.clean = 'clean' in query ? query.clean * 1 : gettext_recored.clean;
                    gettext.handlePo(query.lang, query.path);

                    // 添加依赖
                    this.addDependency(query.path);

                    // 清理原有的来源列表
                    gettext.setLang(query.lang);
                    gettext.cleanCurrentDictReference();
                    break;

                case gettext_recored.path[ query.path ] == query.lang
                    && gettext_recored.lang[ query.lang ] == query.path:
                    // 与之前记录重合
                    break;

                default:
                    console.error({
                        input: query,
                        but: {
                            lang: gettext_recored.path[ query.path ],
                            path: gettext_recored.lang[ query.lang ]
                        }
                    })
                    throw new Error('have re-name po path + lang');
            }

        } else {
            gettext.handlePoTxt(query.lang, '');
        }
    }

    gettext.setLang(query.lang);

    var reference = path.relative(
        path.dirname(query.path),
        this.resourcePath
    );

    const { openTag, closeTag } = gettext_recored;
    const [ freeStart, ...others ] = content.split(openTag);
    return [ freeStart ].concat(
        others.map(one => {
            const list = one.split(closeTag);
            if (list.length > 2) {
                throw new Error(`${one} in ${reference}`);
            }
            const [ content, freeEnd ] = list;
            let enableJsonEncode = false;
            const msgid = content.trim().replace(/^json#\s*/i, () => {
                enableJsonEncode = true;
                return '';
            });
            let result = gettext._(msgid);
            if (enableJsonEncode) {
                result = JSON.stringify(result);
                result = result.substr(1, result.length - 2);
            }
            gettext.updateCurrentDict(msgid, { reference });
            return result + freeEnd;
        })
    ).join('');
};


module.exports.output = function (format_po) {
    format_po = format_po == 'po' ? true : false;
    var p, lang, obj, result = { path: {}, lang: {} };
    for (lang in gettext_recored.lang) {
        if (gettext_recored.clean) {
            gettext.clearDict({ lang, reference: true });
        }
        p = gettext_recored.lang[ lang ];
        obj = gettext.getDictByLang(lang);
        result.path[ p ] = result.lang[ lang ] = format_po ? gettext.obj2po(obj) : obj;
    }
    return result;
};
module.exports.save = function () {
    var files = module.exports.output('po').path;
    var f;
    for (f in files) {
        fs.writeFileSync(f, files[ f ]);
    }
};
