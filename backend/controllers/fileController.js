const fs = require('fs');
const path = require('path');
const { body, query } = require('express-validator');

const File = require('../models/File');
const User = require('../models/User');
const { encryptFile, decryptFileToBuffer } = require('../utils/crypto');

const encryptedDir = path.join(__dirname, '..', 'uploads', 'encrypted');
if (!fs.existsSync(encryptedDir)) fs.mkdirSync(encryptedDir, { recursive: true });

const fileValidation = {
  share: [body('fileId').isMongoId(), body('email').isEmail()],
  download: [query('fileId').isMongoId()],
};

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const tempPath = req.file.path;
  const storageName = `${Date.now()}-${req.file.filename}.enc`;
  const encryptedPath = path.join(encryptedDir, storageName);

  try {
    const iv = await encryptFile(tempPath, encryptedPath);
    fs.unlinkSync(tempPath);

    const expiryMinutes = Number(process.env.FILE_EXPIRY_MINUTES || 10);
    const fileDoc = await File.create({
      originalName: req.file.originalname,
      storageName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      iv,
      owner: req.user._id,
      sharedWith: [],
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    });

    return res.status(201).json({ message: 'File uploaded securely', file: fileDoc });
  } catch (error) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return res.status(500).json({ message: 'File encryption/upload failed', error: error.message });
  }
};

const listFiles = async (req, res) => {
  const files = await File.find({
    $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
  })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  return res.json({ files });
};

const shareFile = async (req, res) => {
  const { fileId, email } = req.body;
  const recipient = await User.findOne({ email: email.toLowerCase() });
  if (!recipient) return res.status(404).json({ message: 'Recipient user not found' });

  const fileDoc = await File.findById(fileId);
  if (!fileDoc) return res.status(404).json({ message: 'File not found' });

  if (String(fileDoc.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Only owner can share this file' });
  }

  if (!fileDoc.sharedWith.includes(recipient._id)) {
    fileDoc.sharedWith.push(recipient._id);
    await fileDoc.save();
  }

  return res.json({ message: `File shared with ${recipient.email}` });
};

const downloadFile = async (req, res) => {
  const { fileId } = req.query;
  const fileDoc = await File.findById(fileId);

  if (!fileDoc) return res.status(404).json({ message: 'File not found' });
  if (new Date() > fileDoc.expiresAt) return res.status(410).json({ message: 'File has expired' });

  const isOwner = String(fileDoc.owner) === String(req.user._id);
  const isShared = fileDoc.sharedWith.some((userId) => String(userId) === String(req.user._id));
  if (!isOwner && !isShared) return res.status(403).json({ message: 'Access denied' });

  const encryptedPath = path.join(encryptedDir, fileDoc.storageName);
  if (!fs.existsSync(encryptedPath)) return res.status(404).json({ message: 'Encrypted file missing' });

  try {
    const fileBuffer = await decryptFileToBuffer(encryptedPath, fileDoc.iv);
    res.setHeader('Content-Type', fileDoc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`);
    return res.send(fileBuffer);
  } catch (error) {
    return res.status(500).json({ message: 'File decryption failed', error: error.message });
  }
};

module.exports = {
  fileValidation,
  uploadFile,
  listFiles,
  shareFile,
  downloadFile,
};
