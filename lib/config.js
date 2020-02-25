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
 * @param String dir The path which the config is located in.
 */
this.load = function( dir ){
    try {
        const config_path = path.join( dir, "config.json" );
        if( fs.existsSync(config_path) ){
            data = fs.readFileSync(config_path, {encoding: 'utf-8'})
            var config = JSON.parse( data );
            return config;
        } else {
            const default_config_path = path.join( dir, "config_default.json" )
            if( fs.existsSync(default_config_path) ){
                fs.writeFileSync( config_path, fs.readFileSync( default_config_path, {encoding: 'utf-8'} ) );
                return this.load( dir );
            }
            return {};
        }
    } catch ( e ) {
        throw e;
    }
}
