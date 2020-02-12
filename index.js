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
const router = express.Router();
const app = express();

const lib = require( "./lib" );
var config;
lib.config.load( __dirname ).then( data => {
    config = data;
    // Registering middleware.
    app.use( session( {secret: config.secret, saveUninitialized: true, resave: true} ) );
    app.use( parser.json() );
    app.use( parser.urlencoded( {extended: true} ) );

    // Defining an error handler.
    app.use( ( err, req, res, next ) => {

    });

    const default_page = ( req, res ) => {};

    // A request for dispatching a login code to a user.
    app.post( "/login", lib.login.login || default_page );
    app.get( "/login", lib.defaults.login_get || default_page );

    // A request for verifying a login with a verification code.
    app.post( "/verify", lib.login.verify || default_page );
    app.get( "/verify", lib.defaults.verify_get || default_page );

    // A placeholder request for icon submission.
    app.put( "/submit_icon", lib.icon.put || default_page );

    app.listen( 8080, () => { console.log( "Application loaded on port 8080." ); } );
});

/**
 * The main function when called from a command line.
 * Launching this way automatically launches a node web server.
 * @see index
 * @param Array<String> args        The command line arguments provided.
 * @return void
 */
function main( args ){

}

// Only run if this script is executed directly.
if( require.main === module ){
    main( process.argv );
}
