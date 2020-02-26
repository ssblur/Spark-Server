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
  if (req.body.email) {
    dispatchEmail(req.body.email);
    message = messageDispatchSuccessfulEmail;
    message.content.email = req.body.email;
    message.content.type = 'email';
    res.type('text/json').send(JSON.stringify(message));
  } else {
    res.type('text/json').send(messageUnsupportedType);
  }
};

/**
 * login.verify
 * @param String    recipient       A phone number or email address a code was
 *         dispatched to.
 * @param String    code            A 6-digit verification code to verify this account.
 * @return String     Verification response format, including JWK if approved,
 *         and a response code, typically 200.
 */
// eslint-disable-next-line no-unused-vars
function verify(recipient, code) {

}
