#!/usr/bin/env node
/**
 * Spark Server Library - Defaults
 * A place for landing and error pages.
 * Includes default responses for get requests on unsupported API hooks.
 * @author Patrick Emery
 */

// A default for GET requests on the login hook.
const loginGet = `{
  status: 400,
  content: {
    comment: "The dispatch function does not support GET requests. Please read API documentation prior to submitting requests.",
  },
}`;
this.dispatchGet = (req, res) => {
  res.status(loginGet.status).send(loginGet);
};

// A default for GET requests on the verify hook.
const verifyGet = `{
  status: 400,
  content: {
    comment: "The verify function does not support GET requests. Please read API documentation prior to submitting requests.",
  },
}`;
this.verifyGet = (req, res) => {
  res.status(verifyGet.status).send(verifyGet);
};
