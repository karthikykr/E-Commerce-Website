const slugify = require('slugify');
const Category = require('../../models/Category');

// Add Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, sortOrder } = req.body;
    const user =req.user;

    const img = req.files.image[0];
    const imageData = {
      name: img.cloudinary.originalName,
      url: img.cloudinary.url,
      publicId: img.cloudinary.publicId,
    };

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Create new category
    const category = new Category({
      name,
      slug,
      description: description || '',
      image: imageData || '',
      parentCategory: parentCategory || null,
      sortOrder: sortOrder || 0,
      userId:user.id,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};
