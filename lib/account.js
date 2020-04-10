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

this.setup = (config) => {
  mailConfig = config.mail;
  templates = mailConfig.templates;
  transport = mail.createTransport(mailConfig['email-address']);
};

/**
 * Function to send out a verification code via email.
 * @param String    recipient       An email address to dispatch a code to.
 * @return  void
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

const messageUnsupportedType = `{
  status: 400,
  content: {
    comment: 'No supported destination parameter specified.',
    supportedParameters: ['email'],
  },
}`;
// eslint-disable-next-line no-unused-vars
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
 * The page served when a client submits a login request.
 */
this.dispatch = (req, res) => {
  let message;
  if ('email' in req.body && req.body.email) {
    if (req.body.email.matches('^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$')) {
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
/**
 * Function to verify a code which has been resubmitted.
 * @param String    recipient       A phone number or email address a code was
 *         dispatched to.
 * @param String    code            A 6-digit verification code to verify this account.
 * @return String     Verification response format, including JWK if approved,
 *         and a response code, typically 200.
 */
async function verify(recipient, code) {
  const result = await mysql.query('select * from verification_table where code=? and email_phone=?', [code, recipient]);
  if (result.length >= 1 && result[0].length >= 1) {
    const row = result[0][0];
    if (row.exp_date > Date.now()) {
      const message = verifiedSuccessfullyMessage;
      message.content.email_phone = recipient;
      const profileInformation = await mysql.query('select * from profile_information where email_phone=?', [recipient]);
      if (profileInformation.length >= 1 && profileInformation[0].length >= 1) {
        const profileRow = profileInformation[0][0];
        message.content.uuid = profileRow.uuid;
        message.content.picture_id = profileRow.picture_id;
        message.content.name = profileRow.user_name;
        message.content.contacts = profileRow.contacts;
      } else {
        await mysql.query('insert into profile_information (uuid, picture_id, email_phone, user_name, contacts) values (UUID(), null, ?, ?, null);', [recipient, recipient]);
        const newProfileInformation = await mysql.query('select * from profile_information where email_phone=?', [recipient]);
        if (newProfileInformation.length >= 1 && newProfileInformation[0].length >= 1) {
          const profileRow = newProfileInformation[0][0];
          message.content.uuid = profileRow.uuid;
          message.content.picture_id = profileRow.picture_id;
          message.content.name = profileRow.user_name;
          message.content.contacts = profileRow.contacts;
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
      session.expiry = expiry;
      session.emailPhone = emailPhone;
      session.uuid = uuid;
    }
    res.send(response);
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
  status: 400,
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

this.accountInfo = async (req, res) => {
  const { session } = req;
  if ('loggedIn' in session && session.loggedIn && new Date(session.expiry) > Date.now()) {
    const profileInformation = await mysql.query('select * from profile_information where uuid=?', [session.uuid]);
    if (profileInformation.length >= 1 && profileInformation[0].length >= 1) {
      const row = profileInformation[0][0];
      const message = accountInfoSuccess;
      message.content.uuid = row.uuid;
      message.content.picture_id = row.picture_id;
      message.content.name = row.user_name;
      message.content.contacts = row.contacts;
      message.content.refresh_by = session.expiry;
      res.type('text/json').send(message);
    } else {
      res.type('text/json').send(accountInfoFailure);
    }
  } else {
    res.type('text/json').send(accountInfoNotLoggedIn);
  }
};

const logoutSuccess = {
  status: 200,
  content: {
    comment: 'You have been logged out.',
  },
};

const logoutNotLoggedIn = {
  status: 400,
  content: {
    comment: 'You are not logged in.',
  },
};

this.logout = (req, res) => {
  const { session } = req;
  if ('loggedIn' in session && session.loggedIn) {
    session.destroy((err) => {
      if (err) {
        log.error(err);
      }
    });
    res.type('text/json').send(logoutSuccess);
  } else {
    res.type('text/json').send(logoutNotLoggedIn);
  }
};
