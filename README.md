# ziey-i18n-loader

[![Build Status](https://travis-ci.org/zemzheng/ziey-i18n-loader.svg)](https://travis-ci.org/zemzheng/ziey-i18n-loader)

webpack i18n loader

## Install

    npm install ziey-i18n-loader

## Usage

    # config in webpack
    {
        test   : /\.(js|html)$/i, 
        loader : "ziey-i18n?lang=<lang>&path=<path_to_po>",
    }

    # Save to po file
    webpack({ /* ... config ... */ });
    // ... done 完成后
    require( 'ziey-i18n-loader' ).save() // save to the path above
