#!/usr/bin/env node
/**
 * Spark Server Library - Defaults
 * A place for landing and error pages.
 * Includes default responses for get requests on unsupported API hooks.
 * @author Patrick Emery
 */

// A default for GET requests on the login hook.
const loginGet = {
  status: 400,
  content: {
    comment: 'The dispatch function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};
this.dispatchGet = (_req, res) => res.status(400).type('text/json').send(loginGet);

// A default for GET requests on the verify hook.
const verifyGet = {
  status: 400,
  content: {
    comment: 'The verify function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};
this.verifyGet = (_req, res) => res.status(400).type('text/json').send(verifyGet);

// A live check message for the server as a whole. Used for debugging.
const serverActive = {
  status: 200,
  content: {
    comment: 'Spark Server is running.',
  },
};
this.serverActive = (_req, res) => res.status(200).type('text/json').send(serverActive);

// A default for GET requests on the modify hook.
const modifyGet = {
  status: 400,
  content: {
    comment: 'The modify function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};

this.modifyGet = (_req, res) => res.status(400).type('text/json').send(modifyGet);

// A default for GET requests on the search hook.
const searchGet = {
  status: 400,
  content: {
    comment: 'The search function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};

this.searchGet = (_req, res) => res.status(400).type('text/json').send(searchGet);

// A default for GET requests on the addMember hook.
const addMemberGet = {
  status: 400,
  content: {
    comment: 'The search function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};

this.addMemberGet = (_req, res) => res.status(400).type('text/json').send(addMemberGet);

// A default for GET requests on the modifyChat hook.
const modifyChatGet = {
  status: 400,
  content: {
    comment: 'The modify chat function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};

this.modifyChatGet = (_req, res) => res.status(400).type('text/json').send(modifyChatGet);

// A default for GET requests on the chatInfo hook.
const chatInfoGet = {
  status: 400,
  content: {
    comment: 'The chat info function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};

this.chatInfoGet = (_req, res) => res.status(400).type('text/json').send(chatInfoGet);

// A default for GET requests on the chatSend hook.
const chatSendGet = {
  status: 400,
  content: {
    comment: 'The search function does not support GET requests. Please read API documentation prior to submitting requests.',
  },
};

this.chatSendGet = (_req, res) => res.status(400).type('text/json').send(chatSendGet);
