#!/usr/bin/env node
/**
 * Spark Server Config
 * Loads a config into a local variable.
 * @author Patrick Emery
 */
this.config = {};

const fs = require('fs');
const path = require('path');

/**
 * Config loader. Used to load in secret, among other things.
 * @param String dir The path which the config is located in.
 */
this.load = (dir) => {
  const configPath = path.join(dir, 'config.json');
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, { encoding: 'utf-8' });
    const config = JSON.parse(data);
    return config;
  }
  const defaultConfigPath = path.join(dir, 'config_default.json');
  if (fs.existsSync(defaultConfigPath)) {
    fs.writeFileSync(configPath, fs.readFileSync(defaultConfigPath, { encoding: 'utf-8' }));
    return this.load(dir);
  }
  return {};
};
