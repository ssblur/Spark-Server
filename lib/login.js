#!/usr/bin/env node
/**
 * Spark Server Library - Login
 * The login manager.
 * Manages the initial login request, accepts an email
 * address or phone number and dispatches a verification code.
 * Also accepts verification codes to provide keys for use.
 * @author Patrick Emery
 */

const mail = require( "nodemailer" );
const template_lib = require( "./templates.js" );
var transport;

var mail_config = {};
var templates = {};

this.setup = ( config ) => {
    mail_config = config["mail"];
    templates = mail_config["templates"]
    transport = mail.createTransport( mail_config["email-address"] );
}

/**
 * Function to send out a verification code via email.
 * @param String    recipient       An email address to dispatch a code to.
 * @return  void
 */
function dispatch_email( recipient ){
    var code = "";
    for(let i = 0; i<6; i++){
        code = code + Math.floor( Math.random() * 10 );
    }
    console.log( "Dispatching code to " + recipient + " via email." );
    const substitutions = {
        "email" : recipient,
        "code" : code
    }
    transport.sendMail({
        from: mail_config["metadata"]["from"], 
        to: recipient, 
        subject: templates["verification-code"]["subject"], 
        html: template_lib.evaluate_template( templates["verification-code"]["body"], substitutions )
      });
}

const message_unsupported_type = {
    "status" :  400,
    "content" : {
        "comment" : "Unsupported type. Supported types are noted below.",
        "supported_types" : ["email"],
        "provided_type" : ""
    }
}
const message_dispatch_successful = {
    "status" : 200,
    "content" : {
        "email" : "",
        "type" : ""
    }
}
/**
 * The page served when a client submits a login request.
 */
this.dispatch = ( req, res ) => {
    if( req.body.type=="email" ){
        dispatch_email( req.body.email );
        var message = message_dispatch_successful;
        message["content"]["email"] = req.body.email;
        message["content"["type"]] = "email";
        res.type( "text/json" ).send( JSON.stringify(message) );
        return;
    } else {
        var message = message_unsupported_type;
        message["content"]["provided_type"] = res.body.type || "Type not specified.";
        res.type( "text/json" ).send( JSON.stringify(message) );
        return;
    }
}

/**
 * login.verify
 * @param String    recipient       A phone number or email address a code was
 *         dispatched to.
 * @param String    code            A 6-digit verification code to verify this account.
 * @return String     Verification response format, including JWK if approved,
 *         and a response code, typically 200.
 */
function verify( recipient, code ){

}
