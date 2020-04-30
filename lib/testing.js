#!/usr/bin/env node
/**
 * Spark Server Library - Testing
 * Pages shown when 'test' is passed as a mode on server start.
 * @author Patrick Emery
 */
const fs = require('fs');

/**
 * Test middleware which serves a file.
 * This page is intended to test chat modification.
 * This page is loaded every time the page is accessed to allow live updates
 * to the page without invalidating session info.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.modify = (req, res) => res.type('text/html').send(fs.readFileSync('./testing/modify.html', { encoding: 'utf-8' }));

/**
 * Test middleware which serves a file.
 * This page is intended to test sending and receiving chat messages.
 * This page is loaded every time the page is accessed to allow live updates
 * to the page without invalidating session info.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.chats = (req, res) => res.type('text/html').send(fs.readFileSync('./testing/chats.html', { encoding: 'utf-8' }));

/**
 * Test middleware which serves a file.
 * This page is intended to test getting and setting contacts for your account.
 * This page is loaded every time the page is accessed to allow live updates
 * to the page without invalidating session info.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.contacts = (req, res) => res.type('text/html').send(fs.readFileSync('./testing/contacts.html', { encoding: 'utf-8' }));
