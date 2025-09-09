const cloudinary = require('cloudinary').v2;
require('dotenv').config;

//configure cloudinnary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Upload an image to Cloudinary
const uploadImage = async (filePath, options = {}) => {
    try{
        return await cloudinary.uploader.upload(filePath, {
            folder: options.folder || 'products',
            transformations: options.transformations || [
                { width: 1000, height: 1000, crop: 'limit', quality: 'auto:good' },
            ],
            ...options,
        });
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

//Delete an image from Cloudinary
const deleteImage = async (publicId) => {
    try{
        if(publicId){
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${error.message}`);
    }
};

//Generate a Cloudinary URL with transformations
const getTransformedUrl = (publicId, transformations = {}) => {
    if(!publicId) return '';
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