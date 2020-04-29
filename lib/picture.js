#!/usr/bin/env node
/**
 * Spark Server Library - Picture Submission
 * Used to receive, store, and redistribute images.
 * @author Patrick Emery
 */

this.submitPicture = (req, res) => {
  res.status(201).send();
};

this.getPicture = (req, res) => {
  res.type('image/jpeg');
};
