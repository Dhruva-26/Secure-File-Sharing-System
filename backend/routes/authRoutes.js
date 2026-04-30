const express = require('express');
const {
  authValidation,
  register,
  login,
  sendOtp,
  verifyOtp,
} = require('../controllers/authController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/register', authValidation.register, validate, register);
router.post('/login', authValidation.login, validate, login);
router.post('/send-otp', authValidation.sendOtp, validate, sendOtp);
router.post('/verify-otp', authValidation.verifyOtp, validate, verifyOtp);

module.exports = router;
