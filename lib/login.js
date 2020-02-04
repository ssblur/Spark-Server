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
 * login.dispatch
 * Arguments:
 *      recipient - String, A phone number or email address to dispatch a code
 *          to.
 * Returns:
 *      String (json), Dispatch format approval
 *          (typically {code: 200, content: "OK"})
 */
function dispatch( recipient ){

}

/**
 * login.verify
 * Arguments:
 *      recipient - String, A phone number or email address to dispatch a code
 *          to.
 *      code - String, A 6-digit verification code to verify this account.
 * Returns:
 *      String (json), Verification response format, including JWK if approved,
 *          and a response code, typically 200.
 */
function verify( recipient, code ){

}
