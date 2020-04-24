#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Spark Server Landing
 * The portal through which Spark server features are accessed.
 * This package will include individual components, as well as a built in server
 * @author Patrick Emery
 */


const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const https = require('https');
const fs = require('fs');
const lib = require('./lib');

const app = express();

const config = lib.config.load(__dirname);

/**
 * The main function when called from a command line.
 * Launching this way automatically launches a node web server.
 * @see index
 * @param Array<String> args The command line arguments provided.
 * @return void
 */
function main() {
  lib.mysql.connect(
    config.mysql.address,
    config.mysql.username,
    config.mysql.password,
    config.mysql.database,
  );

  // Registering middleware.
  app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true,
    cookie: { secure: false, maxAge: 600000 },
  }));
  app.use(parser.urlencoded({ extended: true }));
  app.use(express.json());

  // Defining an error handler.
  app.use((err, req, res, next) => {
    console.log('Error: ', err, req, res, next);
  });

  const defaultPage = (req, res) => {
    console.log('Default Page Loaded!', req.address, res.server);
  };

  // A request for dispatching a login code to a user.
  lib.login.setup(config);
  app.post('/account/dispatch', lib.login.dispatch || defaultPage);
  app.get('/account/dispatch', lib.defaults.dispatchGet || defaultPage);

  // A request for verifying a login with a verification code.
  app.post('/account/verify', lib.login.verify || defaultPage);
  app.get('/account/verify', lib.defaults.verifyGet || defaultPage);

  app.post('/account/logout', lib.login.logout || defaultPage);
  app.get('/account/logout', lib.login.logout || defaultPage);

  app.post('/account/refresh', lib.login.refreshAccount || defaultPage);
  app.get('/account/refresh', lib.login.refreshAccount || defaultPage);

  app.get('/account', lib.login.accountInfo || defaultPage);
  app.post('/account', lib.login.accountInfo || defaultPage);

  // A request for account modification
  app.post('/account/modify', lib.login.modifyAccount || defaultPage);
  app.get('/account/modify', lib.defaults.modifyGet || defaultPage);

  app.post('/account/search', lib.login.searchAccount || defaultPage);
  app.get('/account/search', lib.defaults.searchGet || defaultPage);

  app.post('/chat/create', lib.messages.createChat || defaultPage);
  app.get('/chat/create', lib.messages.createChat || defaultPage);

  app.post('/chat/addMember', lib.messages.addChatMember || defaultPage);
  app.get('/chat/addMember', lib.defaults.addMemberGet || defaultPage);

  app.post('/chat/modify', lib.messages.modifyChat || defaultPage);
  app.get('/chat/modify', lib.defaults.modifyChatGet || defaultPage);

  app.post('/chat/info', lib.messages.chatInfo || defaultPage);
  app.get('/chat/info', lib.defaults.chatInfoGet || defaultPage);

  app.post('/chat/active', lib.messages.getActiveChats || defaultPage);
  app.get('/chat/active', lib.messages.getActiveChats || defaultPage);

  app.post('/chat/send', lib.messages.sendChatMessage || defaultPage);
  app.get('/chat/send', lib.defaults.chatSendGet || defaultPage);

  app.post('/notifications', lib.messages.getNotifications || defaultPage);
  app.get('/notifications', lib.messages.getNotifications || defaultPage);

  app.post('/notifications/clear', lib.messages.clearNotifications || defaultPage);
  app.get('/notifications/clear', lib.messages.clearNotifications || defaultPage);

  app.get('/', lib.defaults.serverActive || defaultPage);

  // Loads in configured servers, using SSL if specified.
  // Disabled servers are no longer loaded.
  const keys = Object.keys(config.server);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof config.server[key] === 'object') {
      const server = config.server[key];
      if (server.enabled) {
        const logger = lib.logger.registerLogger(key);
        if (server.ssl['use-ssl']) {
          const privateKey = fs.readFileSync(server.ssl['private-key']);
          const certificate = fs.readFileSync(server.ssl.certificate);
          logger.debug(`Loading application with SSL on port ${server.port}`);
          https.createServer({
            key: privateKey,
            cert: certificate,
          }, app).listen(parseInt(server.port, 10));
        } else {
          const http = app.listen(parseInt(server.port, 10), () => { logger.debug(`Application loaded on port ${http.address().port}`); });
        }
      }
    }
  }
}

// Only run if this script is executed directly.
if (require.main === module) {
  main();
}
