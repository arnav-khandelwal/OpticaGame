const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  // Check mime type
  const allowedMimeTypes = config.allowedFileTypes;
  const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype);

  if (isAllowedMimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF) are allowed'));
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;