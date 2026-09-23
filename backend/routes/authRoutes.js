const express = require('express');
const { check } = require('express-validator');
const { register, login, forgotPassword, resetPassword, logout, activeToggle } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password of 6+ characters is required').isLength({ min: 6 }),
], register);

router.post('/login', [
  check('email', 'Valid email is required').isEmail(),
  check('password', 'Password is required').exists(),
], login);

router.post('/logout', logout);
router.post('/status/update', activeToggle);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

module.exports = router;
