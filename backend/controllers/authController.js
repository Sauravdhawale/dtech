const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();


// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '360m' });
};

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password , userStatus:1 });
    await user.save();

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login user
exports.login = async (req, res) => {

  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ statusCode: 401, statusMessage : "unauthorised", message: 'User does not exist!' });
    }
    
    if (!(await user.matchPassword(password))) {
      return res.json({ statusCode: 401, statusMessage : "unauthorised", message: 'Invalid credentals!' });

    }

    const token = generateToken(user._id);
    user.token = token;
    user.loginStatus = 1;
    await user.save();

    res.json({ statusCode: 200, statusMessage : "login_success", data : user, message: 'Login successful!' });

  } catch (error) {
    console.log('error')
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.logout = async (req, res) => {
  const { email,token } = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) return res.json({ statusCode: 404, statusMessage : "already_logged_out", message: 'User Already Logged Out' });
    user.loginStatus = undefined;
    user.token = undefined;
    await user.save();
    res.json({ statusCode : 200, statusMessage: 'logged_out_successfully', message : 'User Logged Out Successfully' });
  } catch (error) {
    res.json({ statusCode: 500, statusMessage : "internal_server_error", message: 'Internal Server Error' });
  }
};

exports.activeToggle = async (req, res) => {
  const { email,userStatus } = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) return res.json({ statusCode: 404, statusMessage : "user_does_not_exist", message: 'User does not exist' });
    user.userStatus = userStatus;
    user.loginStatus = 0;
    user.token = undefined;
    await user.save();
    res.json({ statusCode : 200, statusMessage: 'user_status_updated', message : 'User Status updated Successfully' });
  } catch (error) {
    res.json({ statusCode: 500, statusMessage : "internal_server_error", message: 'Internal Server Error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click the link to reset your password: ${resetURL}`;
    const transporter = nodemailer.createTransport({service:"smtppro.zoho.in",host:"smtppro.zoho.in",port:465,secure:true,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}});
    await transporter.sendMail({from:'support@arkentechsolutions.com',to:user.email,subject:'Password Reset',text:message});
    res.json({ message: 'Email sent with password reset instructions' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.token = undefined;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided, please log in again.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.token !== token) return res.status(401).json({ message: 'Token has expired or is invalid, please log in again.' });
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token has expired or is invalid, please log in again.' });
  }
};