const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
    service: "smtppro.zoho.in",
    host: "smtppro.zoho.in",
  port: 465, // Try 587 if 465 doesn't work
  secure: true, // True for SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});
