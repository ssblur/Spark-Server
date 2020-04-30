#!/usr/bin/env node
/**
 * Spark Server Library
 * Functions and Middleware are grouped into library modules for convenience
 * @author Patrick Emery
 */
this.config = require('./config.js');
this.login = require('./account.js');
this.defaults = require('./defaults.js');
this.logger = require('./logger.js');
this.mysql = require('./mysql.js');
this.templates = require('./templates.js');
this.messages = require('./messages.js');
this.testing = require('./testing.js');

this.icon = {};
