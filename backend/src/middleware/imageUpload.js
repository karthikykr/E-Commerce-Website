const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const directories = [
    path.join(__dirname, '../../uploads/products'),
    path.join(__dirname, '../../uploads/featured-products'),
    path.join(__dirname, '../../uploads/banners'),
    path.join(__dirname, '../../uploads/categories'),
    path.join(__dirname, '../../uploads/temp')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
createUploadDirectories();

// Configure storage for different types of uploads
const createStorage = (uploadType) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, `../../uploads/${uploadType}`);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp and random string
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${uploadType}-${uniqueSuffix}${extension}`);
    }
  });
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed!'), false);
  }
};

// Create multer instances for different upload types
const createUploadMiddleware = (uploadType, maxFiles = 1, maxSize = 5 * 1024 * 1024) => {
  return multer({
    storage: createStorage(uploadType),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: maxSize, // Default 5MB
      files: maxFiles
    }
  });
};

// Product image upload (multiple files)
const productImageUpload = createUploadMiddleware('products', 10, 5 * 1024 * 1024);

// Featured product image upload (single file)
const featuredProductImageUpload = createUploadMiddleware('featured-products', 1, 5 * 1024 * 1024);

// Banner image upload (single file, larger size allowed)
const bannerImageUpload = createUploadMiddleware('banners', 1, 10 * 1024 * 1024);

// Category image upload (single file)
const categoryImageUpload = createUploadMiddleware('categories', 1, 3 * 1024 * 1024);

// Image optimization middleware using Sharp
const optimizeImage = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const optimizedFiles = [];

    for (const file of files) {
      if (!file) continue;

      const originalPath = file.path;
      const optimizedPath = originalPath.replace(path.extname(originalPath), '-optimized.webp');
      
      // Optimize image with Sharp
      await sharp(originalPath)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 85,
          effort: 4 
        })
        .toFile(optimizedPath);

      // Update file info
      const optimizedFile = {
        ...file,
        path: optimizedPath,
        filename: path.basename(optimizedPath),
        mimetype: 'image/webp',
        size: fs.statSync(optimizedPath).size
      };

      optimizedFiles.push(optimizedFile);

      // Remove original file
      fs.unlinkSync(originalPath);
    }

    // Update req object
    if (req.files) {
      req.files = optimizedFiles;
    } else {
      req.file = optimizedFiles[0];
    }

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};

// Create thumbnails for product images
const createThumbnails = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.files || [req.file];

    for (const file of files) {
      if (!file) continue;

      const originalPath = file.path;
      const thumbnailPath = originalPath.replace(path.extname(originalPath), '-thumb.webp');
      
      // Create thumbnail
      await sharp(originalPath)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center' 
        })
        .webp({ 
          quality: 80 
        })
        .toFile(thumbnailPath);

      // Add thumbnail info to file object
      file.thumbnail = {
        path: thumbnailPath,
        filename: path.basename(thumbnailPath),
        url: `/uploads/${path.relative(path.join(__dirname, '../../uploads'), thumbnailPath).replace(/\\/g, '/')}`
      };
    }

    next();
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    next(error);
  }
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }

  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Utility function to delete uploaded files
const deleteUploadedFiles = (files) => {
  const filesToDelete = Array.isArray(files) ? files : [files];
  
  filesToDelete.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    // Also delete thumbnail if exists
    if (file && file.thumbnail && file.thumbnail.path && fs.existsSync(file.thumbnail.path)) {
      fs.unlinkSync(file.thumbnail.path);
    }
  });
};

// Utility function to get file URL
const getFileUrl = (file, baseUrl = '') => {
  if (!file || !file.path) return null;
  
  const relativePath = path.relative(path.join(__dirname, '../../uploads'), file.path);
  return `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = {
  productImageUpload,
  featuredProductImageUpload,
  bannerImageUpload,
  categoryImageUpload,
  optimizeImage,
  createThumbnails,
  handleUploadError,
  deleteUploadedFiles,
  getFileUrl,
  createUploadDirectories
};
