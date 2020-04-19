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
  const { body } = req;
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


const modifyChatSuccess = {
  status: 200,
  content: {
    cuuid: '',
    picture_id: '',
    name: '',
  },
};

const modifyChatNoChatSpecified = {
  status: 400,
  content: {
    comment: 'No chat was specified or you are not in this chat.',
  },
};

const modifyChatNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

this.modifyChat = async (req, res) => {
  const { body } = req;
  if (account.isLoggedIn(req)) {
    const message = modifyChatSuccess;
    if (body.cuuid && await this.lib.isInChat(req)) {
      message.content.cuuid = body.cuuid;
      if (body.name) {
        message.content.name = body.name;
        mysql.query('update chat set name=? where cuuid=?;', [body.name, body.cuuid]);
      }
      if (body.picture_id) {
        message.content.picture_id = body.picture_id;
        mysql.query('update chat set picture_id=? where cuuid=?;', [body.picture_id, body.cuuid]);
      }
      res.type('text/json').send(message);
    } else {
      res.type('text/json').status(400).send(modifyChatNoChatSpecified);
    }
  } else {
    res.type('text/json').status(400).send(modifyChatNotLoggedIn);
  }
};

const chatInfoSuccess = {
  status: 200,
  content: {
    cuuid: '',
    picture_id: '',
    name: '',
  },
};

const chatInfoNoChatSpecified = {
  status: 400,
  content: {
    comment: 'No chat was specified or you are not in this chat.',
  },
};

const chatInfoNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

this.chatInfo = async (req, res) => {
  const { body } = req;
  if (account.isLoggedIn(req)) {
    if (body.cuuid && await this.lib.isInChat(req)) {
      const [data] = await mysql.query('select * from chat where cuuid=?', [body.cuuid]);
      const message = chatInfoSuccess;
      const row = data[0];

      message.cuuid = body.cuuid;
      message.picture_id = row.picture_id;
      message.name = row.name;

      res.type('text/json').send(message);
    } else {
      res.type('text/json').status(400).send(chatInfoNoChatSpecified);
    }
  } else {
    res.type('text/json').status(400).send(chatInfoNotLoggedIn);
  }
};

const activeChatsSuccess = {
  status: 200,
  content: {
    chats: [],
  },
};

const activeChatsNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

this.getActiveChats = async (req, res) => {
  if (account.isLoggedIn(req)) {
    const accountInfo = await account.accountInfo(req);
    const [data] = await mysql.query('select cuuid from chat_members where uuid=?', [accountInfo.uuid]);
    const chats = data.entries();
    const chatsOut = [];
    for (let i = 0; i < chats.length; i += 1) {
      chatsOut.push(chats[i].cuuid);
    }

    const message = activeChatsSuccess;
    message.chats = chatsOut;
    res.type('text/json').send(message);
  } else {
    res.type('text/json').status(400).send(activeChatsNotLoggedIn);
  }
};

const sendMessageSuccess = {
  status: 200,
  content: {
    chats: [],
  },
};

const sendMessageNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

const sendMessageUnsupportedType = {
  status: 400,
  content: {
    comment: 'Unsupported message type.',
    provided_type: '',
    supported_types: ['text'],
  },
};

this.sendChatMessage = async (req, res) => {
  const { body } = req;
  if (account.isLoggedIn(req)) {
    if (body.cuuid && await this.lib.isInChat(req)) {
      const accountInfo = await account.accountInfo(req);
      let messageType;
      let content;
      if (body.message_type === 'text') {
        content = body.content;
        messageType = 0;
      } else if (body.message_type === 'image') {
        messageType = 1;
        // @TODO Allow image uploads inline, or modify standards to allow image uploads otherwise.
        // Likely use base64 for image encoding, and include directly in message content field.
      }
      if (messageType != null) {
        mysql.query('insert into chat_messages (uuid, message_type, content, message_sent, sender) values (?, ?, ?, NOW(), ?);', [body.cuuid, messageType, content, accountInfo.uuid]);
        res.type('text/json').send(sendMessageSuccess);
      } else {
        const message = sendMessageUnsupportedType;
        message.content.provided_type = body.message_type || 'No type provided';
        res.type('text/json').send(message);
      }
    }
  } else {
    res.type('text/json').status(400).send(sendMessageNotLoggedIn);
  }
};

this.lib = {};
this.lib.isInChat = async (req) => {
  const [data] = await mysql.query('select * from chat_members where cuuid=?, uuid=?;', [req.body.cuuid, req.session.uuid]);
  return data.length >= 1;
};
