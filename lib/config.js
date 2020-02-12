#!/usr/bin/env node
/**
 * Spark Server Config
 * Loads a config into a local variable.
 * @author Patrick Emery
 */
var config = {}

var fs = require('fsPromises')
var path = require('path')

var config_path = path.join( __dirname, "config.json" )
fs.readFile(config_path, {encoding: 'utf-8'}).then(( data ) =>{

}).catch( ( err ) =>{

})
