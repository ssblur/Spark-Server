#!/usr/bin/env node
/**
 * Spark Server Library - Picture Submission
 * Used to receive, store, and redistribute images.
 * @author Patrick Emery
 */

/**
 * Middleware for submitting a new picture.
 * @TODO
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.submitPicture = (req, res) => {
  res.status(201).send();
};

/**
 * Middleware for returning a picture which was previously submitted.
 * In prod, pictures should be served by a CDN, this is needlessly stressful to the server.
 * @TODO
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.getPicture = (req, res) => {
  res.type('image/jpeg');
};
