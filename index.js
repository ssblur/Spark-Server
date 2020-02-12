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

app.use( session( {secret: '', saveUninitialized: true, resave: true} ) );
app.use( parser.json());
app.use( bodyParser.urlencoded( {extended: true} ) );
app.use( express.static(__dirname + '/pages') );

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
