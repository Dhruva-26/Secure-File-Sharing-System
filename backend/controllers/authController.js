const bcrypt = require('bcryptjs');
const { body } = require('express-validator');

const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateToken } = require('../utils/jwt');
const { sendOtpEmail } = require('../services/emailService');

const otpTTL = Number(process.env.OTP_TTL_MINUTES || 10);

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const authValidation = {
  register: [body('name').isLength({ min: 2 }), body('email').isEmail(), body('password').isLength({ min: 8 })],
  login: [body('email').isEmail(), body('password').notEmpty()],
  sendOtp: [body('email').isEmail(), body('purpose').isIn(['register', 'login'])],
  verifyOtp: [body('email').isEmail(), body('otp').isLength({ min: 6, max: 6 }), body('purpose').isIn(['register', 'login'])],
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'Email already exists. Please login instead.' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: hash, isVerified: false });

    return res.status(201).json({
      message: 'Registration successful. Please verify OTP sent to email.',
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'User is not verified with OTP' });

    return res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (purpose === 'register' && !user) {
      return res.status(404).json({ message: 'User not found. Register first.' });
    }

    if (purpose === 'login') {
      if (!user) return res.status(404).json({ message: 'User not found. Please register first.' });
      if (!user.isVerified) return res.status(403).json({ message: 'Verify your account OTP from registration first.' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + otpTTL * 60 * 1000);

    await Otp.deleteMany({ email: normalizedEmail, purpose });
    await Otp.create({ email: normalizedEmail, otp, purpose, expiresAt, verified: false });

    // Handle SMTP failures without crashing the Node process.
    try {
      await sendOtpEmail(normalizedEmail, otp, purpose);
    } catch (emailError) {
      await Otp.deleteMany({ email: normalizedEmail, purpose });
      return res.status(502).json({
        message: 'Unable to send OTP email. Check SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in backend .env.',
        error: emailError.message,
      });
    }

    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    const normalizedEmail = email.toLowerCase();

    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      otp,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    otpDoc.verified = true;
    await otpDoc.save();

    if (purpose === 'register') {
      await User.findOneAndUpdate({ email: normalizedEmail }, { isVerified: true });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

module.exports = {
  authValidation,
  register,
  login,
  sendOtp,
  verifyOtp,
};
