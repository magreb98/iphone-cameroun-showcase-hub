
const { Router } = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');

const router = Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ['name'] }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ['name'] }]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a product (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, imageUrl, categoryId, quantity, inStock, isOnPromotion, promotionPrice, promotionEndDate } = req.body;
    
    const product = await Product.create({
      name,
      price,
      imageUrl,
      categoryId,
      quantity,
      inStock,
      isOnPromotion: isOnPromotion || false,
      promotionPrice,
      promotionEndDate
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { name, price, imageUrl, categoryId, quantity, inStock, isOnPromotion, promotionPrice, promotionEndDate } = req.body;
    
    product.name = name || product.name;
    product.price = price || product.price;
    product.imageUrl = imageUrl || product.imageUrl;
    product.categoryId = categoryId || product.categoryId;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.isOnPromotion = isOnPromotion !== undefined ? isOnPromotion : product.isOnPromotion;
    product.promotionPrice = promotionPrice !== undefined ? promotionPrice : product.promotionPrice;
    product.promotionEndDate = promotionEndDate !== undefined ? promotionEndDate : product.promotionEndDate;
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle promotion status (Admin only)
router.patch('/:id/toggle-promotion', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { isOnPromotion, promotionPrice, promotionEndDate } = req.body;
    
    product.isOnPromotion = isOnPromotion !== undefined ? isOnPromotion : !product.isOnPromotion;
    
    if (product.isOnPromotion) {
      product.promotionPrice = promotionPrice || product.promotionPrice;
      product.promotionEndDate = promotionEndDate || product.promotionEndDate;
    } else {
      product.promotionPrice = null;
      product.promotionEndDate = null;
    }
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.destroy();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
