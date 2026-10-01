const categoryModel = require('../models/categoryModel');

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const categories = await categoryModel.getAll();
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories/:id
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoryModel.getById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/categories (Admin only)
async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    // Check uniqueness
    const existing = await categoryModel.findByName(name.trim());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    const newCategory = await categoryModel.create({
      name: name.trim(),
      description,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/categories/:id (Admin only)
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await categoryModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    if (name && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await categoryModel.findByName(name.trim());
      if (duplicate && duplicate.id !== parseInt(id, 10)) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists.',
        });
      }
    }

    const updated = await categoryModel.update(id, { name, description });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/categories/:id (Admin only)
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await categoryModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    await categoryModel.deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
