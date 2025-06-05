
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { body, param, validationResult } = require('express-validator');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    // Count products in each category
    for (let category of categories) {
      const productCount = await Product.count({
        where: { categoryId: category.id }
      });
      category.dataValues.productCount = productCount;
    }
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Get a single category
router.get(
  '/:id',
  [param('id', 'Category ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{ model: Product }],
      });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Create a category (Admin only)
router.post(
  '/',
  [
    protect,
    admin,
    body('name', 'Name is required and must be a string').not().isEmpty().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('imageUrl', 'Image URL must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, imageUrl } = req.body;

      const category = await Category.create({
        name,
        description,
        imageUrl,
      });

      res.status(201).json(category);
    } catch (error) {
      // Check for Sequelize UniqueConstraintError (e.g., if category name must be unique)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Category name already exists.' });
      }
      next(error); // Pass other errors to the global handler
    }
  }
);

// Update a category (Admin only)
router.put(
  '/:id',
  [
    protect,
    admin,
    param('id', 'Category ID must be an integer').isInt(),
    body('name', 'Name must be a non-empty string if provided').optional().not().isEmpty().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('imageUrl', 'Image URL must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const { name, description, imageUrl } = req.body;

      if (name !== undefined) category.name = name;
      if (description !== undefined) category.description = description;
      if (imageUrl !== undefined) category.imageUrl = imageUrl;

      await category.save();

      res.json(category);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Category name already exists.' });
      }
      next(error); // Pass other errors to the global handler
    }
  }
);

// Delete a category (Admin only)
router.delete(
  '/:id',
  [protect, admin, param('id', 'Category ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    
    // Check if category has products
    const productCount = await Product.count({
      where: { categoryId: category.id }
    });
    
    if (productCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with associated products' });
    }
    
    await category.destroy();
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
