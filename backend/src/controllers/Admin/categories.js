const slugify = require('slugify');
const { deleteImage } = require('../../config/cloudinaryConfig');
const Category = require('../../models/Category');

// Add Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, sortOrder } = req.body;
    const userId = req.user.id;

    //Check if category already exists by name (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') }, // case-insensitive match
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category with name "${name}" already exists`,
      });
    }

    const CategoryImage = req.files?.image?.[0];
    let imageData = null;
    if (CategoryImage) {
      imageData = {
        name: CategoryImage.cloudinary.originalName,
        url: CategoryImage.cloudinary.url,
        publicId: CategoryImage.cloudinary.publicId,
      };
    }

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
      userId: userId,
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

// Get Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category by ID and populate parent category (if needed)
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
};

//Update Category
exports.updateCategory = async (req, res) => {
  try {
    const CategoryId = req.params.id;
    const userId = req.user.id;
    const { name, description, parentCategory, sortOrder } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(CategoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check duplicate name if name is being updated
    if (name && name.toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp('^' + name + '$', 'i') },
        _id: { $ne: CategoryId }, // exclude current category
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Category with name "${name}" already exists`,
        });
      }
    }

    // Handle image upload
    const CategoryImage = req.files?.image?.[0];
    let imageData = existingCategory.image || null;

    if (CategoryImage) {
      // Delete old image if exists
      if (existingCategory?.image?.publicId) {
        const deleted = await deleteImage(existingCategory.image.publicId);
        if (!deleted)
          console.warn('Failed to delete old image from Cloudinary');
      }

      imageData = {
        name: CategoryImage.cloudinary.originalName,
        url: CategoryImage.cloudinary.url,
        publicId: CategoryImage.cloudinary.publicId,
      };
    }

    // Generate slug only if name is updated
    const slug = name
      ? slugify(name, { lower: true, strict: true })
      : existingCategory.slug;

    const updateResult = await Category.updateOne(
      { _id: CategoryId },
      {
        $set: {
          name: name || existingCategory.name,
          slug,
          description: description ?? existingCategory.description,
          image: imageData,
          parentCategory: parentCategory ?? existingCategory.parentCategory,
          sortOrder: sortOrder ?? existingCategory.sortOrder,
          userId,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No changes made ',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};
