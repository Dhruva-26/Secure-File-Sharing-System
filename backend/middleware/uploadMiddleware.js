const multer = require('multer');
const path = require('path');
const fs = require('fs');

const tempDir = path.join(__dirname, '..', 'uploads', 'tmp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, tempDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const allowedTypes = ['image/', 'application/pdf', 'text/plain', 'application/zip'];

const fileFilter = (_, file, cb) => {
  const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type));
  if (!isAllowed) return cb(new Error('Unsupported file type'));
  return cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

module.exports = { upload };
