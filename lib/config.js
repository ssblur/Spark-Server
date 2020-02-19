#!/usr/bin/env node
/**
 * Spark Server Config
 * Loads a config into a local variable.
 * @author Patrick Emery
 */
this.config = {};

const fs = require('fs');
const path = require('path');

/**
 * Config loader. Used to load in secret, among other things.
 * @param String    dir         The path which the config is located in.
 */
this.load = function( dir ){
    try {
        var config_path = path.join( dir, "config_default.json" );
        var data = fs.readFileSync(config_path, {encoding: 'utf-8'});
        var default_config = JSON.parse( data );
        config_path = path.join( dir, "config.json" );
        data = fs.readFileSync(config_path, {encoding: 'utf-8'})
        var config = JSON.parse( data );
        for( let i in config ){
            default_config[i] = config[i] || default_config[i];
        }
        return default_config;
    } catch ( e ) {
        throw e;
    }
}
