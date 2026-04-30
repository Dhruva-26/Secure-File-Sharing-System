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
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return res.status(409).json({ message: 'Email already exists' });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hash, isVerified: false });

  return res.status(201).json({
    message: 'Registration successful. Please verify OTP sent to email.',
    userId: user._id,
  });
};

const login = async (req, res) => {
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
};

const sendOtp = async (req, res) => {
  const { email, purpose } = req.body;
  const normalizedEmail = email.toLowerCase();

  if (purpose === 'register') {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'User not found. Register first.' });
  }

  if (purpose === 'login') {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + otpTTL * 60 * 1000);

  await Otp.deleteMany({ email: normalizedEmail, purpose });
  await Otp.create({ email: normalizedEmail, otp, purpose, expiresAt, verified: false });
  await sendOtpEmail(normalizedEmail, otp, purpose);

  return res.json({ message: 'OTP sent successfully' });
};

const verifyOtp = async (req, res) => {
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

  // Mark account verified after registration OTP.
  if (purpose === 'register') {
    await User.findOneAndUpdate({ email: normalizedEmail }, { isVerified: true });
  }

  return res.json({ message: 'OTP verified successfully' });
};

module.exports = {
  authValidation,
  register,
  login,
  sendOtp,
  verifyOtp,
};
