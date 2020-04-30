#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * A library for managing logging, and making it simpler to discern between different servers.
 * @author Patrick Emery
 */
const loggers = {};

/**
 * A convenience for logging information.
 * Not used much, but formats text and circumvents no-console.
 */
class Logger {
  constructor(name, level) {
    this.name = name;
    this.level = level;
  }

  /**
   * Logs the provided values in the info format.
   * @param  {...any} messages The messages to log.
   */
  info(...messages) {
    if (this.level >= 2) {
      let workingString = `[${this.name}] `;
      for (let i = 0; i < messages.length; i += 1) { workingString += messages[i]; }
      console.log(workingString);
    }
  }

  /**
   * Logs the provided values in the debug format.
   * @param  {...any} messages The messages to log.
   */
  debug(...messages) {
    if (this.level >= 1) {
      let workingString = `\x1b[33m[${this.name}] `;
      for (let i = 0; i < messages.length; i += 1) { workingString += messages[i]; }
      console.log(`${workingString}\x1b[0m`);
    }
  }

  /**
   * Logs the provided values in the error format.
   * @param  {...any} messages The messages to log.
   */
  error(...messages) {
    let workingString = `\x1b[31m[${this.name}] `;
    for (let i = 0; i < messages.length; i += 1) { workingString += messages[i]; }
    console.log(`${workingString}\x1b[0m`);
  }
}

/**
 * Generates a new logger or returns an existing logger of the provided name.
 * @param {String} name The name of this logger.
 */
this.registerLogger = (name) => {
  if (!loggers[name]) {
    loggers[name] = new Logger(name, 2);
  }
  return loggers[name];
};
