const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (to, otp, purpose) => {
  const subject = `Your ${purpose} OTP Code`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Secure File Sharing System</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 3px;">${otp}</h1>
      <p>This OTP will expire in ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { sendOtpEmail };
