const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../icsp/public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}${path.extname(file.originalname)}`;
    req.uploadedFilename = uniqueFilename;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ storage: storage });

// Image upload endpoint
router.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    filename: req.uploadedFilename
  });
});

module.exports = router;