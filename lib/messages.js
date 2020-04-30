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
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

this.createChat = async (req, res) => {
  if (account.isLoggedIn(req)) {
    const accountInfo = await account.accountInfo(req);
    const [[{ cuuid }]] = await mysql.query('select UUID() as cuuid;');
    mysql.query('insert into chat (uuid, picture_id, chat_name) values (?, null, ?);', [cuuid, 'New Chat']);
    mysql.query('insert into chat_members (cuuid, uuid) values (?, ?);', [cuuid, accountInfo.uuid]);

    const message = createChatSuccess;
    message.content.cuuid = cuuid;
    res.type('text/json').send(message);
  } else {
    res.type('text/json').status(401).send(createChatNotLoggedIn);
  }
};

const addChatUserNotInChat = {
  status: 403,
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
  status: 401,
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
      if (await this.lib.isInChat(req)) {
        if (body.uuid) { mysql.query('insert into chat_members (cuuid, uuid) values (?,?);', [body.cuuid, body.uuid]); } else { res.type('text/json').send(addChatNoUserSpecified); }

        const message = addChatSuccess;
        message.content.uuid = body.uuid;
        message.content.cuuid = body.cuuid;
        res.type('text/json').send(message);
      } else {
        res.type('text/json').status(403).send(addChatUserNotInChat);
      }
    } else {
      res.type('text/json').status(400).send(addChatNoChatSpecified);
    }
  } else {
    res.type('text/json').status(401).send(addChatNotLoggedIn);
  }
};

const getUsersUserNotInChat = {
  status: 403,
  content: {
    comment: 'You are not in this chat.',
  },
};

const getUsersNoChatSpecified = {
  status: 400,
  content: {
    comment: 'No chat was specified.',
  },
};

const getUsersNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

const getUsersSuccess = {
  status: 200,
  content: {
    cuuid: '',
    members: [],
  },
};

this.getChatUsers = async (req, res) => {
  const { body } = req;
  if (account.isLoggedIn(req)) {
    if (body.cuuid) {
      if (await this.lib.isInChat(req)) {
        const [members] = await mysql.query('select * from chat_members where cuuid=?;', [body.cuuid]);
        const memberList = [];
        for (let i = 0; i < members.length; i += 1) {
          memberList.push(members[i].uuid);
        }

        const message = getUsersSuccess;
        message.content.members = memberList;
        message.content.cuuid = body.cuuid;
        res.type('text/json').send(message);
      } else {
        res.type('text/json').status(403).send(getUsersUserNotInChat);
      }
    } else {
      res.type('text/json').status(400).send(getUsersNoChatSpecified);
    }
  } else {
    res.type('text/json').status(401).send(getUsersNotLoggedIn);
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
  status: 403,
  content: {
    comment: 'No chat was specified or you are not in this chat.',
  },
};

const modifyChatNotLoggedIn = {
  status: 401,
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
      message.content.picture_id = undefined;
      message.content.name = undefined;
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
      res.type('text/json').status(403).send(modifyChatNoChatSpecified);
    }
  } else {
    res.type('text/json').status(401).send(modifyChatNotLoggedIn);
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
  status: 403,
  content: {
    comment: 'No chat was specified or you are not in this chat.',
  },
};

const chatInfoNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

this.chatInfo = async (req, res) => {
  const { body } = req;
  if (account.isLoggedIn(req)) {
    if (body.cuuid && await this.lib.isInChat(req)) {
      const [data] = await mysql.query('select * from chat where uuid=?', [body.cuuid]);
      const message = chatInfoSuccess;
      const row = data[0];

      message.content.cuuid = body.cuuid;
      message.content.picture_id = row.picture_id;
      message.content.name = row.chat_name;

      res.type('text/json').send(message);
    } else {
      res.type('text/json').status(403).send(chatInfoNoChatSpecified);
    }
  } else {
    res.type('text/json').status(401).send(chatInfoNotLoggedIn);
  }
};

const chatMessagesSuccess = {
  status: 200,
  content: {
    messages: [],
  },
};

const chatMessagesNoChatSpecified = {
  status: 403,
  content: {
    comment: 'No chat was specified or you are not in this chat.',
  },
};

const chatMessagesNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

this.chatMessages = async (req, res) => {
  const { body } = req;
  if (account.isLoggedIn(req)) {
    if (body.cuuid && await this.lib.isInChat(req)) {
      const [data] = await mysql.query('select * from chat_messages where uuid=?', [body.cuuid]);
      const content = [];
      for (let i = 0; i < data.length; i += 1) {
        content.push(this.lib.packMessage(data[i]));
      }

      const message = chatMessagesSuccess;
      message.content.messages = content;
      res.type('text/json').send(message);
    } else {
      res.type('text/json').status(403).send(chatMessagesNoChatSpecified);
    }
  } else {
    res.type('text/json').status(401).send(chatMessagesNotLoggedIn);
  }
};

const activeChatsSuccess = {
  status: 200,
  content: {
    chats: [],
  },
};

const activeChatsNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

this.getActiveChats = async (req, res) => {
  if (account.isLoggedIn(req)) {
    const accountInfo = await account.accountInfo(req);
    const [data] = await mysql.query('select cuuid from chat_members where uuid=?', [accountInfo.uuid]);
    const chatsOut = [];
    for (let i = 0; i < data.length; i += 1) {
      chatsOut.push(data[i].cuuid);
    }

    const message = activeChatsSuccess;
    message.content.chats = chatsOut;
    res.type('text/json').send(message);
  } else {
    res.type('text/json').status(401).send(activeChatsNotLoggedIn);
  }
};

const sendMessageSuccess = {
  status: 200,
  content: {},
};

const sendMessageNotLoggedIn = {
  status: 401,
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
      const [messageType, content] = this.lib.unpackMessage(body);
      if (messageType != null) {
        const [[{ now }]] = await mysql.query('select NOW() as now;');
        mysql.query('insert into chat_messages (uuid, message_type, content, message_sent, sender) values (?, ?, ?, ?, ?);', [body.cuuid, messageType, content, now, accountInfo.uuid]);
        mysql.query('insert into unread_messages (cuuid, message_sent, uuid) select ? as cuuid, ? as message_sent, uuid from chat_members where cuuid=?', [body.cuuid, now, body.cuuid]);
        res.type('text/json').send(sendMessageSuccess);
      } else {
        const message = sendMessageUnsupportedType;
        message.content.provided_type = body.message_type || 'No type provided';
        res.type('text/json').status(400).send(message);
      }
    }
  } else {
    res.type('text/json').status(401).send(sendMessageNotLoggedIn);
  }
};

const getNotificationsSuccess = {
  status: 200,
  content: {
    messages: [],
  },
};

const getNotificationsNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

this.getNotifications = async (req, res) => {
  if (account.isLoggedIn(req)) {
    const [notifications] = await mysql.query('select * from unread_messages join chat_messages where unread_messages.cuuid=chat_messages.uuid and unread_messages.message_sent=chat_messages.message_sent and unread_messages.uuid=?;', req.session.uuid);
    const messages = [];
    for (let i = 0; i < notifications.length; i += 1) {
      messages.push(this.lib.packMessage(notifications[i].message_type,
        notifications[i].content,
        notifications[i].cuuid,
        notifications[i].message_sent,
        notifications[i].sender));
    }
    getNotificationsSuccess.content.messages = messages;
    res.type('text/json').send(getNotificationsSuccess);
  } else {
    res.type('text/json').status(401).send(getNotificationsNotLoggedIn);
  }
};

const clearNotificationsSuccess = {
  status: 200,
  content: {
    comment: 'Successfully cleared notifications.',
  },
};

const clearNotificationsNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

this.clearNotifications = async (req, res) => {
  if (account.isLoggedIn(req)) {
    mysql.query('delete from unread_messages where uuid=?;', req.session.uuid);
    res.type('text/json').send(clearNotificationsSuccess);
  } else {
    res.type('text/json').status(400).send(clearNotificationsNotLoggedIn);
  }
};

this.lib = {};

this.lib.isInChat = async (req) => {
  const [data] = await mysql.query('select * from chat_members where cuuid=? and uuid=?;', [req.body.cuuid, req.session.uuid]);
  return data.length >= 1;
};

this.lib.unpackMessage = (body) => {
  if (body.message_type === 'text') {
    if ('content' in body && (typeof body.content) === (typeof '')) {
      return [0, body.content];
    }
  }
  return [null, null];
};

const packedMessage = {
  message_type: '',
  content: {},
  cuuid: '',
  message_sent: '',
  sender: '',
};
this.lib.packMessage = (messageType, content, cuuid, messageSent, sender) => {
  if (messageType === 0) {
    const message = packedMessage;
    message.message_type = 'text';
    message.content = content;
    message.cuuid = cuuid;
    message.message_sent = messageSent;
    message.sender = sender;
    return message;
  }
  return { type: 'Unknown' };
};
