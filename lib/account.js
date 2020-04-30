#!/usr/bin/env node
/**
 * Spark Server Library - Accounts
 * Account functions and logins.
 * Manages the initial login request, accepts an email
 * address or phone number and dispatches a verification code.
 * Also accepts verification codes to provide keys for use.
 * Additionally handles logouts and account settings.
 * @author Patrick Emery
 */

const mail = require('nodemailer');
const templateLib = require('./templates.js');
const mysql = require('./mysql.js');
const logger = require('./logger.js');

const log = logger.registerLogger('Spark Server');

let transport;

let mailConfig = {};
let templates = {};

/**
 * A setup function for pulling config info on mail.
 * @param {Object} config The config info provided.
 */
this.setup = (config) => {
  mailConfig = config.mail;
  templates = mailConfig.templates;
  transport = mail.createTransport(mailConfig['email-address']);
};

/**
 * Function to send out a verification code via email.
 * @param {String} recipient An email address to dispatch a code to.
 */
function dispatchEmail(recipient) {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += Math.floor(Math.random() * 10);
  }
  const expDate = new Date();
  expDate.setHours(expDate.getHours() + 1);
  const data = {
    code,
    exp_date: expDate,
    email_phone: recipient,
  };

  const substitutions = {
    email: recipient,
    code,
  };
  transport.sendMail({
    from: mailConfig.metadata.from,
    to: recipient,
    subject: templates['verification-code'].subject,
    html: templateLib.evaluateTemplate(templates['verification-code'].body, substitutions),
  });

  mysql.query('replace into verification_table set ?;', data, (error) => {
    if (error) { log.info(error); }
  });
}

const messageUnsupportedType = {
  status: 400,
  content: {
    comment: 'No supported destination parameter specified.',
    supportedParameters: ['email'],
  },
};

const messageInvalidFormat = {
  status: 400,
  content: {
    comment: 'The format of the provided destination was invalid.',
  },
};

const messageDispatchSuccessfulEmail = {
  status: 200,
  content: {
    email: '',
    type: '',
  },
};

/**
 * Middleware to serve verification code dispatch requests.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.dispatch = (req, res) => {
  let message;
  if ('email' in req.body && req.body.email) {
    if (req.body.email.match('^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$')) {
      dispatchEmail(req.body.email);
      message = messageDispatchSuccessfulEmail;
      message.content.email = req.body.email;
      message.content.type = 'email';
      res.type('text/json').send(message);
    } else {
      res.type('text/json').send(messageInvalidFormat);
    }
  } else {
    res.type('text/json').send(messageUnsupportedType);
  }
};


const verifiedSuccessfullyMessage = {
  status: 200,
  content: {
    email_phone: '',
    refresh_by: '',
    uuid: '',
    picture_id: '',
    name: '',
    contacts: '',
    comment: 'Verification successful.',
  },
};

const verificationFailedMessage = {
  status: 400,
  content: {
    email_phone: '',
    comment: 'Verification code invalid.',
  },
};

const verificationCodeUnsetMessage = {
  status: 400,
  content: {
    comment: 'No verification code was provided.',
  },
};

const verificationEmailUnsetMessage = {
  status: 400,
  content: {
    comment: 'No email address or phone was provided.',
  },
};

/**
 * Function to verify a code which has been resubmitted.
 * @param {String} recipient A phone number or email address a code was dispatched to.
 * @param {String} code A 6-digit verification code to verify this account.
 * @return {String} A tuple of a boolean representing success and the message to send to the user.
 */
async function verify(recipient, code) {
  const result = await mysql.query('select * from verification_table where code=? and email_phone=?', [code, recipient]);
  if (result.length >= 1 && result[0].length >= 1) {
    const [[row]] = result;
    if (row.exp_date > Date.now()) {
      const message = verifiedSuccessfullyMessage;
      message.content.email_phone = recipient;
      const profileInformation = await mysql.query('select * from profile_information where email_phone=?', [recipient]);
      if (profileInformation.length >= 1 && profileInformation[0].length >= 1) {
        const profileRow = profileInformation[0][0];
        message.content.uuid = profileRow.uuid;
        message.content.picture_id = profileRow.picture_id;
        message.content.name = profileRow.user_name;
        message.content.contacts = profileRow.contacts ? profileRow.contacts.toString('utf-8') : null;
      } else {
        await mysql.query('insert into profile_information (uuid, picture_id, email_phone, user_name, contacts) values (UUID(), null, ?, ?, null);', [recipient, recipient]);
        const newProfileInformation = await mysql.query('select * from profile_information where email_phone=?', [recipient]);
        if (newProfileInformation.length >= 1 && newProfileInformation[0].length >= 1) {
          const profileRow = newProfileInformation[0][0];
          message.content.uuid = profileRow.uuid;
          message.content.picture_id = profileRow.picture_id;
          message.content.name = profileRow.user_name;
          message.content.contacts = profileRow.contacts ? profileRow.contacts.toString('utf-8') : null;
        }
      }
      const refreshBy = new Date();
      refreshBy.setDate(refreshBy.getDate() + 1);
      message.content.refresh_by = refreshBy.toISOString();

      mysql.query('delete from verification_table where email_phone=?', [recipient]);
      return [true, message.content.uuid, message];
    }
    mysql.query('delete from verification_table where email_phone=?', [recipient]);
  }
  const message = verificationFailedMessage;
  message.email_phone = recipient;
  return [false, '', message];
}

/**
 * Middleware which enables verification code submission.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.verify = async (req, res) => {
  const { session } = req;
  let emailPhone = 'email_phone' in session ? session.email_phone : null;
  emailPhone = 'email_phone' in req.body ? req.body.email_phone : emailPhone;
  if ('code' in req.body && req.body.code && emailPhone) {
    const [success, uuid, response] = await verify(emailPhone, req.body.code);
    if (success) {
      session.loggedIn = true;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      session.expiry = expiry.toISOString();
      session.emailPhone = emailPhone;
      session.uuid = uuid;
    }
    res.type('text/json').status(response.status).send(response);
  } else if (!('code' in req.body)) {
    res.type('text/json').status(400).send(verificationCodeUnsetMessage);
  } else if (!emailPhone) {
    res.type('text/json').status(400).send(verificationEmailUnsetMessage);
  }
};

const accountInfoSuccess = {
  status: 200,
  content: {
    email_phone: '',
    refresh_by: '',
    uuid: '',
    picture_id: '',
    name: '',
    contacts: '',
  },
};

const accountInfoNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

const accountInfoFailure = {
  status: 500,
  content: {
    comment: 'Unable to find account info. Please try logging out and back in.',
  },
};

/**
 * Middleware which provides the user with their account information.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.accountInfo = async (req, res) => {
  if (this.lib.isLoggedIn(req)) {
    const profileInformation = await this.lib.accountInfo(req);
    if (profileInformation) {
      const message = accountInfoSuccess;
      message.content.uuid = profileInformation.uuid;
      message.content.picture_id = profileInformation.pictureID;
      message.content.name = profileInformation.name;
      message.content.contacts = profileInformation.contacts;
      message.content.refresh_by = profileInformation.expiry;
      message.content.email_phone = profileInformation.email_phone;
      res.type('text/json').send(message);
    } else {
      res.type('text/json').status(500).send(accountInfoFailure);
    }
  } else {
    res.type('text/json').status(401).send(accountInfoNotLoggedIn);
  }
};

const accountSearchSuccess = {
  status: 200,
  content: {
    email_phone: '',
    uuid: '',
    picture_id: '',
    name: '',
  },
};

const accountSearchNoEmail = {
  status: 400,
  content: {
    comment: 'No email or phone provided.',
  },
};

const accountSearchNoneFound = {
  status: 200,
  content: {
    comment: 'No matching account found.',
  },
};

/**
 * Middleware which allows clients to search for users by their registration email / phone.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.searchAccount = async (req, res) => {
  const { body } = req;
  if ('email_phone' in body) {
    const [data] = (await mysql.query('select * from profile_information where email_phone=?', [body.email_phone]));
    if (data.length >= 1) {
      const [accountInfo] = data;
      const message = accountSearchSuccess;
      message.content.email_phone = accountInfo.email_phone;
      message.content.picture_id = accountInfo.picture_id;
      message.content.name = accountInfo.user_name;
      message.content.uuid = accountInfo.uuid;
      res.type('text/json').status(200).send(accountSearchSuccess);
    } else {
      res.type('text/json').status(200).send(accountSearchNoneFound);
    }
  } else if ('uuid' in body) {
    const [data] = (await mysql.query('select * from profile_information where uuid=?', [body.uuid]));
    if (data.length >= 1) {
      const [accountInfo] = data;
      const message = accountSearchSuccess;
      message.content.email_phone = accountInfo.email_phone;
      message.content.picture_id = accountInfo.picture_id;
      message.content.name = accountInfo.user_name;
      message.content.uuid = accountInfo.uuid;
      res.type('text/json').status(200).send(accountSearchSuccess);
    } else {
      res.type('text/json').status(200).send(accountSearchNoneFound);
    }
  } else {
    res.type('text/json').status(400).send(accountSearchNoEmail);
  }
};

const logoutSuccess = {
  status: 200,
  content: {
    comment: 'You have been logged out.',
  },
};

const logoutNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

/**
 * Middleware which allows clients to log out.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.logout = (req, res) => {
  const { session } = req;
  if (this.lib.isLoggedIn(req)) {
    session.destroy((err) => {
      if (err) {
        log.error(err);
      }
    });
    res.type('text/json').send(logoutSuccess);
  } else {
    res.type('text/json').status(400).send(logoutNotLoggedIn);
  }
};

const modifyAccountSuccess = {
  status: 202,
  content: {
    email_phone: '',
    refresh_by: '',
    uuid: '',
    picture_id: '',
    name: '',
    contacts: '',
  },
};

const modifyAccountNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in.',
  },
};

/**
 * Middleware which allows clients to update account info.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.modifyAccount = async (req, res) => {
  const { body } = req;
  if (this.lib.isLoggedIn(req)) {
    const data = await this.lib.accountInfo(req);
    if ('name' in body && (typeof body.name) === (typeof '')) {
      mysql.query('update profile_information set user_name=? where uuid=?;', [body.name, data.uuid]);
      data.name = body.name;
    }
    if ('picture_id' in body && (typeof body.picture_id) === (typeof '')) {
      mysql.query('update profile_information set picture_id=? where uuid=?;', [body.picture_id, data.uuid]);
      data.pictureID = body.picture_id;
    }
    if ('contacts' in body) {
      mysql.query('update profile_information set contacts=? where uuid=?;', [JSON.stringify(body.contacts), data.uuid]);
      data.contacts = JSON.stringify(body.contacts);
    }


    const message = modifyAccountSuccess;
    message.content.email_phone = data.emailPhone;
    message.content.uuid = data.uuid;
    message.content.picture_id = data.pictureID;
    message.content.name = data.name;
    message.content.contacts = data.contacts;
    message.content.refresh_by = data.expiry;
    res.type('text/json').status(202).send(message);
  } else {
    res.type('text/json').status(401).send(modifyAccountNotLoggedIn);
  }
};

const refreshSuccess = {
  status: 200,
  content: {
    refresh_by: '',
  },
};

const refreshNotLoggedIn = {
  status: 401,
  content: {
    comment: 'You are not logged in',
  },
};

/**
 * Middleware which allows clients to refresh their login expiry.
 * API documentation is listed on Confluence.
 * @param {Express.Request} req The request information passed to this Middleware.
 * @param {Express.Response} res The response object this Middleware uses to post
 * information back to the user.
 */
this.refreshAccount = (req, res) => {
  if (this.lib.isLoggedIn(req)) {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 1);
    req.session.expiry = newExpiry.toISOString();

    const message = refreshSuccess;
    message.content.refresh_by = newExpiry.toISOString();
    res.type('text/json').send(message);
  } else {
    res.type('text/json').status(401).send(refreshNotLoggedIn);
  }
};


this.lib = {};

/**
 * Middleware which allows clients to send messages and updates to chat.
 * @param {Express.Request} req The request information passed to the Middleware running this
 * function.
 * @return {Boolean} true if the user is currently logged in.
 */
this.lib.isLoggedIn = (req) => 'loggedIn' in req.session && req.session.loggedIn && new Date(req.session.expiry) > Date.now();

/**
 * A convenience function for getting a user's account information.
 * @param {Express.Request} req The request information passed to the Middleware running this
 * function.
 * @return {Object} An object containing the logged-in user's name, email or phone, uuid,
 * picture ID, contacts object, and session expiry.
 */
this.lib.accountInfo = async (req) => {
  const data = (await mysql.query('select * from profile_information where uuid=?', [req.session.uuid]))[0][0];
  return {
    emailPhone: data.email_phone,
    uuid: data.uuid,
    pictureID: data.picture_id,
    name: data.user_name,
    contacts: data.contacts ? data.contacts.toString('utf-8') : null,
    expiry: req.session.expiry,
  };
};
