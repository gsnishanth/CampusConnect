const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

// Use memory storage so we can pass buffer to Cloudinary or write to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  const extension = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes[extension] === file.mimetype;

  if (mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single('image');

/**
 * Upload a buffer to Cloudinary (if configured) or local uploads/ folder.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadToCloudinary = (buffer, folder = 'campusconnect', mimetype) => {
  return new Promise((resolve, reject) => {
    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    } else {
      // Fallback: save to local uploads/ directory
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const extension = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      }[mimetype] || 'jpg';
      const filename = `${crypto.randomUUID()}.${extension}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFile(filepath, buffer, (err) => {
        if (err) return reject(err);
        resolve(`/uploads/${filename}`);
      });
    }
  });
};

module.exports = { upload, uploadToCloudinary };
