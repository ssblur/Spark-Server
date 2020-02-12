#!/usr/bin/env node
/**
 * Spark Server Library - Defaults
 * A place for landing and error pages.
 * Includes default responses for get requests on unsupported API hooks.
 * @author Patrick Emery
 */

// A default for GET requests on the login hook.
const login_get = {
    "status" :  400,
    "content" : {
        "comment" : "The login function does not support GET requests.\n" +
                    "Please read API documentation prior to submitting requests."
    }
}
this.login_get = ( req, res ) => {
    res.status( login_get.status ).send( JSON.stringify( login_get ) );
}

// A default for GET requests on the verify hook.
const verify_get = {
    "status" :  400,
    "content" : {
        "comment" : "The verify function does not support GET requests.\n" +
                    "Please read API documentation prior to submitting requests."
    }
}
this.verify_get = ( req, res ) => {
    res.status( login_get.status ).send( JSON.stringify( verify_get ) );
}
