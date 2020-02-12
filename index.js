#!/usr/bin/env node
/**
 * Spark Server Landing
 * The portal through which Spark server features are accessed.
 * This package will include individual components, as well as a built in server
 * @author Patrick Emery
 */

/**
 * The main function when called from a command line.
 * Launching this way automatically launches a node web server.
 * @see index
 * @param Array<String> args        The command line arguments provided.
 * @return void
 */
function main( args ){
    global route;
    const express = require( "express" )
    const route =
}

// Only run if this script is executed directly.
if( require.main === module ){
    main( process.argv );
}
