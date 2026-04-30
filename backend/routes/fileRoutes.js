const express = require('express');
const {
  fileValidation,
  uploadFile,
  listFiles,
  shareFile,
  downloadFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.post('/share', fileValidation.share, validate, shareFile);
router.get('/download', fileValidation.download, validate, downloadFile);

module.exports = router;
