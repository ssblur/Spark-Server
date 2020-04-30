#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Spark Server Testing
 * Tests module functionality for a most server modules.
 * @author Patrick Emery
 */
const lib = require('../lib');

(async () => {
  const log = lib.logger.registerLogger('Debug');

  const config = lib.config.load(__dirname);

  if (config.secret) {
    log.info('Secret is set, config loaded.');
  } else {
    log.error('Secret is not set, config did not load as intended.');
  }

  if (config.mysql) {
    lib.mysql.connect(
      config.mysql.address,
      config.mysql.username,
      config.mysql.password,
      config.mysql.database,
    );

    log.info('Starting MySQL Test Query');
    lib.mysql.query('select 1;', (err) => {
      if (err) {
        log.error('Error executing test query:\n', err);
      } else {
        log.info('MySQL Test Query Succeeded.');
      }
    });
  } else {
    log.error('MySQL settings not configured.');
  }

  const testTemplateOut = lib.templates.evaluateTemplate('Test template: {value}', { value: 1234 });
  const expectedTemplateOut = 'Test template: 1234';
  if (testTemplateOut === expectedTemplateOut) {
    log.debug('Templating working as expected. \n', '\tExpected Output:\n\t\t', expectedTemplateOut, '\n\tActual Output:\n\t\t', testTemplateOut);
  } else {
    log.error('Template did not work as expected. \n', '\tExpected Output:\n\t\t', expectedTemplateOut, '\n\tActual Output:\n\t\t', testTemplateOut);
  }
})();
