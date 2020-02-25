#!/usr/bin/env node
/**
 * Spark Server Landing
 * The portal through which Spark server features are accessed.
 * This package will include individual components, as well as a built in server
 * @author Patrick Emery
 */



const express = require( 'express' );
const session = require( 'express-session' );
const parser = require( 'body-parser' );
const https = require( 'https' );
const fs = require( 'fs' );
const router = express.Router();
const app = express();
const disabled_app = express();

const lib = require( "./lib" );
var config;

disabled_app.use( ( req, res ) => {
    res.send("The server cannot be accessed through this port.")
})

config = lib.config.load( __dirname )

/**
 * The main function when called from a command line.
 * Launching this way automatically launches a node web server.
 * @see index
 * @param Array<String> args        The command line arguments provided.
 * @return void
 */
function main( args ){
    // Registering middleware.
    app.use( session( {secret: config.secret, saveUninitialized: true, resave: true} ) );
    app.use( parser.urlencoded( {extended: true} ) );
    app.use( express.json() );

    // Defining an error handler.
    app.use( ( err, req, res, next ) => {

    });

    const default_page = ( req, res ) => {};

    // A request for dispatching a login code to a user.
    lib.login.setup( config );
    app.post( "/account/dispatch", lib.login.dispatch || default_page );
    app.get( "/account/dispatch", lib.defaults.dispatch_get || default_page );

    // A request for verifying a login with a verification code.
    app.post( "/account/verify", lib.login.verify || default_page );
    app.get( "/account/verify", lib.defaults.verify_get || default_page );

    // A placeholder request for icon submission.
    app.put( "/account/submit_icon", lib.icon.put || default_page );

    // Loads in configured servers, using SSL if specified.
    // Disabled servers are still loaded, but explicitly serve a banner noting
    // that they are disabled.
    for(const i in config["server"]){
        const server = config["server"][i];
        if(server["enabled"]){
            if(server["ssl"]["use-ssl"]){
                const private_key = fs.readFileSync(server["ssl"]["private-key"]);
                const certificate = fs.readFileSync(server["ssl"]["certificate"]);
                console.log( "Loading application with SSL on port "+server["port"] );
                https.createServer({
                    key: private_key,
                    cert: certificate
                }, app).listen( parseInt(server["port"]) );
            } else {
                var http = app.listen( parseInt(server["port"]), () => { console.log( "Application loaded on port "+http.address().port ); } );
            }
        } else {
            if(server["ssl"]["use-ssl"]){
                const private_key = fs.readFileSync(server["ssl"]["private-key"]);
                const certificate = fs.readFileSync(server["ssl"]["certificate"]);
                console.log( "Loading application with SSL on port "+server["port"] );
                https.createServer({
                    key: private_key,
                    cert: certificate
                }, disabled_app).listen( parseInt(server["port"]) );
            } else {
                var http = disabled_app.listen( parseInt(server["port"]), () => { console.log( "Application loaded on port "+http.address().port ); } );
            }
        }
    }
}

// Only run if this script is executed directly.
if( require.main === module ){
    main( process.argv );
}
