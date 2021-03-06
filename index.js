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
const process = require('process');
const cors = require('cors');
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

  const corsOptions = {
    origin: (origin, next) => {
      if (config.whitelist === '*') { next(null, true); } else if (config.whitelist.includes(origin)) { next(null, true); } else next(new Error('Domain not permitted.'));
    },
  };
  // Allowing CORS on this app.
  app.use(cors(corsOptions));

  // Registering middleware.
  app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true,
    cookie: { secure: false, maxAge: 600000 },
  }));
  // Middleware for parsing encoded information in GET requests.
  app.use(parser.urlencoded({ extended: true }));
  // Middleware for parsing incoming JSON ahead of time.
  app.use(express.json());

  // Defining an incredibly simple error handler.
  app.use((err, req, res, next) => {
    console.log('Error: ', err, req, res, next);
  });

  // Setting headers so that Cookies work cross-domain and only expire after a day.
  app.use((req, res, next) => {
    res.header('Access-Control-Max-Age', 86400);
    next();
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

  // A request for logging out.
  app.post('/account/logout', lib.login.logout || defaultPage);
  app.get('/account/logout', lib.login.logout || defaultPage);

  // An interface for refreshing your session.
  app.post('/account/refresh', lib.login.refreshAccount || defaultPage);
  app.get('/account/refresh', lib.login.refreshAccount || defaultPage);

  // An interface for getting account information.
  app.get('/account', lib.login.accountInfo || defaultPage);
  app.post('/account', lib.login.accountInfo || defaultPage);

  // A request for account modification
  app.post('/account/modify', lib.login.modifyAccount || defaultPage);
  app.get('/account/modify', lib.defaults.modifyGet || defaultPage);

  // An interface for searching for new contacts or getting other users' info.
  app.post('/account/search', lib.login.searchAccount || defaultPage);
  app.get('/account/search', lib.defaults.searchGet || defaultPage);

  // An interface for creating new chats.
  app.post('/chat/create', lib.messages.createChat || defaultPage);
  app.get('/chat/create', lib.messages.createChat || defaultPage);

  // An interface for adding members to chats.
  app.post('/chat/addMember', lib.messages.addChatMember || defaultPage);
  app.get('/chat/addMember', lib.defaults.addMemberGet || defaultPage);

  // An interface for changing chat names and pictures.
  app.post('/chat/modify', lib.messages.modifyChat || defaultPage);
  app.get('/chat/modify', lib.defaults.modifyChatGet || defaultPage);

  // An interface for getting information on a given chat.
  app.post('/chat/info', lib.messages.chatInfo || defaultPage);
  app.get('/chat/info', lib.defaults.chatInfoGet || defaultPage);

  // An interface for getting a user's active chats.
  app.post('/chat/active', lib.messages.getActiveChats || defaultPage);
  app.get('/chat/active', lib.messages.getActiveChats || defaultPage);

  // An interface for sending a message to a given chat.
  app.post('/chat/send', lib.messages.sendChatMessage || defaultPage);
  app.get('/chat/send', lib.defaults.chatSendGet || defaultPage);

  // An interface for getting messages from a given chat.
  app.post('/chat/get', lib.messages.chatMessages || defaultPage);
  app.get('/chat/get', lib.defaults.getMessagesGet || defaultPage);

  // An interface for getting the members of a chat.
  app.post('/chat/members', lib.messages.getChatUsers || defaultPage);
  app.get('/chat/members', lib.defaults.chatMemberGet || defaultPage);

  // An interface for getting all unread notifications.
  app.post('/notifications', lib.messages.getNotifications || defaultPage);
  app.get('/notifications', lib.messages.getNotifications || defaultPage);

  // An interface for clearing out unread notifications.
  app.post('/notifications/clear', lib.messages.clearNotifications || defaultPage);
  app.get('/notifications/clear', lib.messages.clearNotifications || defaultPage);

  // Test mode pages. Should not be loaded in prod.
  if (process.argv.includes('test')) {
    app.get('/testing/modify', lib.testing.modify || defaultPage);
    app.get('/testing/chats', lib.testing.chats || defaultPage);
    app.get('/testing/contacts', lib.testing.contacts || defaultPage);
  }

  // A default live-check message to check server status on.
  app.use('/', lib.defaults.serverActive || defaultPage);

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
