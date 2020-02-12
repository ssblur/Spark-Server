#!/usr/bin/env node
/**
 * Spark Server Config
 * Loads a config into a local variable.
 * @author Patrick Emery
 */
this.config = {};

const fs = require('fs').promises;
const path = require('path');

/**
 * Config loader. Used to load in secret, among other things.
 * @param String    dir         The path which the config is located in.
 */
this.load = function( dir ){
    let promise = new Promise( ( fulfill, reject ) => {
        try {
            var config_path = path.join( dir, "config_default.json" )
            fs.readFile(config_path, {encoding: 'utf-8'}).then(( data ) =>{
                var default_config = JSON.parse( data );
                var config_path = path.join( dir, "config.json" )
                fs.readFile(config_path, {encoding: 'utf-8'}).then(( data ) =>{
                    var config = JSON.parse( data );
                    for( let i in config ){
                        default_config[i] = config[i] || default_config[i];
                    }
                    fulfill( default_config );
                }).catch( ( e ) =>{
                    reject( e );
                })
            }).catch( ( e ) =>{
                reject( e );
            })
        } catch ( e ) {
            reject( e );
        }
    } );
    return promise;
}
