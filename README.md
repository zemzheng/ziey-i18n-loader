# ziey-i18n-loader

webpack i18n loader

## Install

    npm install ziey-i18n-loader

## Usage

    # config in webpack
    {
        test   : /\.(js|html)$/i, 
        loader : "ziey-i18n",
        options : {
            openTag  : '{#',
            closeTag : '#}',
            lang     : "en_US",     // lang
            path     : './en_US.po' // po file path 会根据该路径更新
        }
    }

    # Save to po file
    webpack({ /* ... config ... */ });
    // ... done 完成后
    require( 'ziey-i18n-loader' ).save() // save to the path above
