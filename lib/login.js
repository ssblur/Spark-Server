#!/usr/bin/env node
/**
 * Spark Server Library - Login
 * The login manager.
 * Manages the initial login request, accepts an email
 * address or phone number and dispatches a verification code.
 * Also accepts verification codes to provide keys for use.
 * @author Patrick Emery
 */

/**
 * Function to send out a verification code.
 * @param String    recipient       A phone number or email address to dispatch a code
 *          to.
 * @return  String      Dispatch format approval, in JSON
 *          (typically {code: 200, content: "OK"})
 */
function dispatch( recipient ){

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
