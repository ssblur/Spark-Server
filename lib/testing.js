#!/usr/bin/env node
/**
 * Spark Server Library - Testing
 * Pages shown when 'test' is passed as a mode on server start.
 * @author Patrick Emery
 */
const fs = require('fs');

this.modify = (req, res) => res.type('text/html').send(fs.readFileSync('./testing/modify.html', { encoding: 'utf-8' }));
this.chats = (req, res) => res.type('text/html').send(fs.readFileSync('./testing/chats.html', { encoding: 'utf-8' }));
