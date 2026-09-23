const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

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

// Function to send an email
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from:'CRM Team <'+process.env.EMAIL_USER+'>',
    cc: 'Alerts <support@arkentechsolutions.com>',
    to,
    subject,
    html
  };

  try {
    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;