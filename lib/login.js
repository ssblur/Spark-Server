#!/usr/bin/env node
/**
 * Spark Server Library - Login
 * The login manager.
 * Manages the initial login request, accepts an email
 * address or phone number and dispatches a verification code.
 * Also accepts verification codes to provide keys for use.
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
    dispatchEmail(req.body.email);
    message = messageDispatchSuccessfulEmail;
    message.content.email = req.body.email;
    message.content.type = 'email';
    res.type('text/json').send(JSON.stringify(message));
  } else {
    res.type('text/json').send(messageUnsupportedType);
  }
};


const verifiedSuccessfullyMessage = {
  status: 200,
  content: {
    email_phone: '',
    refresh_by: '',
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
      message.email_phone = recipient;

      const refreshBy = new Date();
      refreshBy.setDate(refreshBy.getDate() + 1);
      message.refresh_by = refreshBy.toISOString;

      mysql.query('delete from verification_table where email_phone=?', [recipient]);
      return [true, message];
    }
    mysql.query('delete from verification_table where email_phone=?', [recipient]);
  }
  const message = verificationFailedMessage;
  message.email_phone = recipient;
  return [false, message];
}

this.verify = async (req, res) => {
  const { session } = req;
  let emailPhone = 'email_phone' in session ? session.email_phone : null;
  emailPhone = 'email_phone' in req.body ? req.body.email_phone : emailPhone;
  if ('code' in req.body && req.body.code && emailPhone) {
    const response = await verify(emailPhone, req.body.code);
    if (response[0]) {
      req.session.loggedIn = true;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      req.session.expiry = expiry;
      req.session.emailPhone = emailPhone;
    }
    res.send(response[1]);
  }
};

this.logout = (req, res) => {
  const { session } = req;
  if ('signedIn' in session && session.signedIn) {
    session.destroy((err) => {
      if (err) {
        log.error(err);
      }
    });
    res.type('text/json').send();
  }
};
