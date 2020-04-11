#!/usr/bin/env node
/**
 * Spark Server Library - Messages
 * Chats and messages.
 * Functions for starting new chats, sending messages to existing chats, and reading chat data.
 * @author Patrick Emery
 */
const lib = require('./index.js');

const { mysql } = lib;
const account = lib.login.lib;

const createChatSuccess = {
  status: 200,
  content: {
    cuuid: '',
  },
};

const createChatNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

this.createChat = async (req, res) => {
  if (account.isLoggedIn(req)) {
    const accountInfo = await account.accountInfo(req);
    const [{ cuuid }] = await mysql.query('select UUID() as cuuid;');
    mysql.query('insert into chat (uuid, picture_id, chat_name) values (?, null, ?);', [cuuid, 'New Chat']);
    mysql.query('insert into chat_members (cuuid, uuid) values (?, ?);', [cuuid, accountInfo.uuid]);

    const message = createChatSuccess;
    message.content.cuuid = cuuid;
    res.type('text/json').send(message);
  } else {
    res.type('text/json').status(400).send(createChatNotLoggedIn);
  }
};

const addChatUserNotInChat = {
  status: 400,
  content: {
    comment: 'You are not in this chat.',
  },
};

const addChatNoChatSpecified = {
  status: 400,
  content: {
    comment: 'No chat was specified.',
  },
};

const addChatNoUserSpecified = {
  status: 400,
  content: {
    comment: 'No user was specified',
  },
};

const addChatNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

const addChatSuccess = {
  status: 200,
  content: {
    comment: 'User successfully added to chat.',
    cuuid: '',
    uuid: '',
  },
};

this.addChatMember = async (req, res) => {
  const { body } = res;
  if (account.isLoggedIn(req)) {
    if (body.cuuid) {
      const accountInfo = await account.accountInfo(req);
      const [data] = await mysql.query('select * from chat_members where cuuid=?, uuid=?;', [body.cuuid, accountInfo.uuid]);
      if (data.length >= 1) {
        if (body.uuid) { mysql.query('insert into chat_members (cuuid, uuid) values (?,?);', [body.cuuid, body.uuid]); } else { res.type('text/json').send(addChatNoUserSpecified); }

        const message = addChatSuccess;
        message.uuid = body.uuid;
        message.cuuid = body.cuuid;
        res.type('text/json').send(message);
      } else {
        res.type('text/json').status(400).send(addChatUserNotInChat);
      }
    } else {
      res.type('text/json').status(400).send(addChatNoChatSpecified);
    }
  } else {
    res.type('text/json').status(400).send(addChatNotLoggedIn);
  }
};
