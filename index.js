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

}

/**
 * The main function when called from a recognized web server or with the web
 * setting set.
 * Used internally by the internal node web server.
 * @param Object<Dict<String : any>>    args    The POST arguments posited
 *          by a given request, if any.
 * @return  String      The headers and content for a given request.
 */
function index( args ){

}

// Only run if this script is executed directly.
if( require.main === module ){
    var run = false;
    // Checks if the "--server" or "-s" have been passed to the script.
    process.argv.forEach( argument =>{
        if( argument.startsWith("--") ){
            if( argument=="--server" ){
                main( process.argv );
                run = true;
            }
        } else if( argument.startsWith("-") ){
            if( argument.includes("s") ){
                main( process.argv );
                run = true;
            }
        }
    })

    // If no alternate run method was defined, this just runs the script as if
    // it were hosted on a web server.
    if( !run ){
        console.log( "Module run directly without server arg. Running as script.")
        print( index( {} ) )
    }
}
