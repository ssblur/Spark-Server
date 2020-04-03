#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Spark Server Testing
 * Tests module functionality for a most server modules.
 * @author Patrick Emery
 */
const lib = require('./lib');

const configData = lib.config.load(__dirname);

if (configData.secret) {
  console.log('Secret is set, config loaded.');
} else {
  console.log('Secret is not set, config did not load as intended.');
}
