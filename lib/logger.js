#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * A library for managing logging, and making it simpler to discern between different servers.
 * @author Patrick Emery
 */
const loggers = {};

class Logger {
  constructor(name, level) {
    this.name = name;
    this.level = level;
  }

  info(...messages) {
    if (this.level >= 2) {
      let workingString = `[${this.name}] `;
      for (let i = 0; i < messages.length; i += 1) { workingString += messages[i]; }
      console.log(workingString);
    }
  }

  debug(...messages) {
    if (this.level >= 1) {
      let workingString = `\x1b[33m[${this.name}] `;
      for (let i = 0; i < messages.length; i += 1) { workingString += messages[i]; }
      console.log(`${workingString}\x1b[0m`);
    }
  }

  error(...messages) {
    let workingString = `\x1b[31m[${this.name}] `;
    for (let i = 0; i < messages.length; i += 1) { workingString += messages[i]; }
    console.log(`${workingString}\x1b[0m`);
  }
}

this.registerLogger = (name) => {
  if (!loggers[name]) {
    loggers[name] = new Logger(name, 2);
  }
  return loggers[name];
};
