const multer = require('multer');
const { uploadImage } = require('../config/cloudinaryConfig');

const storage = multer.memoryStorage();
const Upload = multer({ storage });

/**
 * Middleware to upload files to Cloudinary
 * Attach Cloudinary info to req.files so controller can access it like req.files.image[0].cloudinary
 */
const upload = (fields = []) => {
  return [
    Upload.fields(fields),
    async (req, res, next) => {
      try {
        // Loop through all uploaded fields
        for (const field in req.files) {
          for (const file of req.files[field]) {
            const result = await uploadImage(file.buffer, {
              folder: field,
              public_id: file.originalname.replace(/\s+/g, '_'),
            });

            // Attach Cloudinary info directly to the file object
            file.cloudinary = {
              originalName: file.originalname,
              url: result.secure_url,
              publicId: result.public_id,
            };
          }
        }

        next();
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },
  ];
};

module.exports = { upload };

// for mutiple images

// router.post(
//   '/addsite',
//   cloudinaryUpload([
//     { name: 'siteImages', maxCount: 10 },
//     { name: 'documents', maxCount: 5 }
//   ]),
//   addSite
// );

// const siteImgs = req.files.siteImages;  // array of files
// siteImgs.forEach(file => console.log(file.cloudinary));

// const docs = req.files.documents;       // array of files
// docs.forEach(file => console.log(file.cloudinary));
