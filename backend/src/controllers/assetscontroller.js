const path = require('path');

const Asset = require('../models/Asset');

const getFileType = (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (file.mimetype) {
    const mime = file.mimetype.toLowerCase();
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpeg';
    if (mime.includes('png')) return 'png';
    if (mime.includes('pdf')) return 'pdf';
  }

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'jpeg';
    case '.png':
      return 'png';
    case '.pdf':
      return 'pdf';
    default:
      return 'unknown';
  }
};

// add assets for sites

exports.createAssetsHandler = async ({
  files,
  entityId,
  assetType,
  session,
}) => {
  if (!files || files.length === 0) throw new Error('No files uploaded');
  if (!entityId || !assetType) throw new Error('Missing metadata');

  const assets = files.map((file) => ({
    imageURL: file.cloudinary.url,
    name: file.originalname,
    fileType: getFileType(file),
    publicId: file.cloudinary.publicId,
    entityId,
    assetType,
  }));

  return Asset.insertMany(assets, { session });
};

// get assets for sites
exports.getAssetsByEntity = async (entityId) => {
  return Asset.find({
    entityId,
  });
};
