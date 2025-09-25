const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file (path or buffer) to Cloudinary
 * @param {string|Buffer} file
 * @param {Object} options
 */
const uploadImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(file)) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: options.folder || 'products', ...options },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(file);
    } else if (typeof file === 'string') {
      cloudinary.uploader
        .upload(file, { folder: options.folder || 'products', ...options })
        .then(resolve)
        .catch(reject);
    } else {
      reject(
        new Error('Invalid file type. Must be a Buffer or file path string.')
      );
    }
  });
};

// Delete an image by public_id
const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error(`Error deleting image: ${error.message}`);
  }
};

// Generate transformed URL
const getTransformedUrl = (publicId, transformations = {}) => {
  if (!publicId) return '';
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getTransformedUrl,
};
