/* eslint-disable no-console */
/* eslint-disable func-names */
const nodemailer = require('nodemailer');

module.exports.sendOne = function (email, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vitaljchik@gmail.com',
      pass: 'vitalj1996...'
    }
  });

  const mailOptions = {
    from: 'vitaljchik@gmail.com', // sender address
    to: email, // list of receivers
    subject,
    text
  };

  return transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};
