const { Router } = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImage = require('../models/ProductImage');
const Location = require('../models/Location');
const User = require('../models/User');
const { protect, admin, locationAccess } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to uploads/products directory
    cb(null, path.join(__dirname, '../uploads/products'));
  },
  filename: function (req, file, cb) {
    // Use a unique filename: timestamp-originalname
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

// Get all products with pagination
router.get(
  '/',
  [
    query('page', 'Page must be an integer').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be an integer').optional().isInt({ min: 1 }),
    query('categoryId', 'Category ID must be an integer').optional().isInt(),
    query('locationId', 'Location ID must be an integer').optional().isInt(),
    query('minPrice', 'Minimum price must be a number').optional().isNumeric(),
    query('maxPrice', 'Maximum price must be a number').optional().isNumeric(),
    query('search', 'Search term must be a string').optional().isString(),
    query('sortBy', 'SortBy must be a string').optional().isString(), // Could add .isIn(['price', 'name', 'createdAt'])
    query('orderBy', 'OrderBy must be a string').optional().isString().toUpperCase().isIn(['ASC', 'DESC']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Use validated and sanitized values if needed, or rely on parseInt/parseFloat as before
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      // Category and location filters
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null; // categoryId from query
      const locationId = req.query.locationId ? parseInt(req.query.locationId) : null; // locationId from query

      // Price filters
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      // Search filter
      const searchQuery = req.query.search || null;

      // Sorting
      const sortBy = req.query.sortBy || 'createdAt';
      const orderBy = req.query.orderBy || 'DESC';


      // Build the where clause
      const whereClause = {};
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }
      if (locationId) {
        whereClause.locationId = locationId;
      }
      if (minPrice !== null) {
        whereClause.price = { ...whereClause.price, [Op.gte]: minPrice };
      }
      if (maxPrice !== null) {
        whereClause.price = { ...whereClause.price, [Op.lte]: maxPrice };
      }
      if (searchQuery) {
        whereClause.name = { [Op.like]: `%${searchQuery}%` }; // Simple name search
      }

      // Get total count for pagination
      const count = await Product.count({ where: whereClause });

      // Fetch products with pagination
      const products = await Product.findAll({
        where: whereClause,
        limit,
        offset,
        include: [
          { model: Category, attributes: ['name'] },
          { model: Location, attributes: ['name'] },
          { model: ProductImage, attributes: ['id', 'imageUrl', 'isMainImage'] }
        ],
        order: [[sortBy, orderBy]]
      });
    
    res.json({
      products,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get products for the current admin's location
router.get('/user', protect, admin, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build the where clause based on user role
    const whereClause = {};
    
    // Si ce n'est pas un super admin, limiter aux produits de son emplacement
    if (!req.user.isSuperAdmin && req.user.locationId) {
      whereClause.locationId = req.user.locationId;
    }
    
    // Get total count for pagination
    const count = await Product.count({ where: whereClause });
    
    // Fetch products with pagination
    const products = await Product.findAll({
      where: whereClause,
      limit,
      offset,
      include: [
        { model: Category, attributes: ['name'] },
        { model: Location, attributes: ['name'] },
        { model: ProductImage, attributes: ['id', 'imageUrl', 'isMainImage'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      products,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a single product
router.get(
  '/:id',
  [param('id', 'Product ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
        { model: Category, attributes: ['name'] },
        { model: Location, attributes: ['name'] },
        { model: ProductImage, attributes: ['id', 'imageUrl', 'isMainImage'] }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Create a product (Admin only)
router.post(
  '/',
  [
    protect,
    admin,
    body('name', 'Name is required and must be a string').not().isEmpty().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('price', 'Price is required and must be numeric').isNumeric(),
    // 'stock' is referred to as 'quantity' in the existing code for this route
    body('quantity', 'Stock/Quantity must be an integer').isInt(),
    body('categoryId', 'Category ID is required and must be an integer').isInt(),
    // 'locationId' is handled conditionally below based on admin role, so direct validation here might conflict.
    // We'll rely on the existing logic for locationId assignment and validation for now.
    // body('locationId', 'Location ID must be an integer').isInt(),
    body('configurations', 'Configurations must be an array').optional().isArray(),
    body('configurations.*.name', 'Configuration name must be a non-empty string').if(body('configurations').exists()).not().isEmpty().isString(),
    body('configurations.*.value', 'Configuration value must be a non-empty string').if(body('configurations').exists()).not().isEmpty().isString(),
    // 'images' are handled by multer and a separate route, not directly in this POST body.
    // The existing 'imageUrl' seems to be for a single main image URL string.
    body('imageUrl', 'Image URL must be a string').optional().isString(),
    // Additional fields from existing code
    body('inStock', 'In stock must be a boolean').optional().isBoolean(),
    body('isOnPromotion', 'Is on promotion must be a boolean').optional().isBoolean(),
    body('promotionPrice', 'Promotion price must be numeric').optional().isNumeric(),
    body('promotionEndDate', 'Promotion end date must be a valid date').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // name, price, categoryId, quantity are primary fields from validation
      // description, imageUrl, inStock, isOnPromotion, promotionPrice, promotionEndDate are also validated
      const {
        name, description, price, imageUrl, categoryId, quantity,
        inStock, isOnPromotion, promotionPrice, promotionEndDate
        // configurations will be handled later if implemented
      } = req.body;

      // Si l'utilisateur n'est pas un super admin, utiliser son emplacement
      let locationId = req.body.locationId;
    
    if (!req.user.isSuperAdmin) {
      locationId = req.user.locationId;
      
      if (!locationId) {
        return res.status(400).json({ message: "Vous n'êtes associé à aucun emplacement" });
      }
    } else if (!locationId) {
      return res.status(400).json({ message: "L'ID de l'emplacement est requis" });
    }
    
    const product = await Product.create({
      name,
      price,
      imageUrl,
      categoryId,
      locationId,
      quantity,
      inStock,
      isOnPromotion: isOnPromotion || false,
      promotionPrice,
      promotionEndDate
    });
    
    // Create a main product image
    await ProductImage.create({
      productId: product.id,
      imageUrl: product.imageUrl,
      isMainImage: true
    });
    
    // Charger le produit avec les relations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, attributes: ['name'] },
        { model: Location, attributes: ['name'] },
        { model: ProductImage, attributes: ['id', 'imageUrl', 'isMainImage'] }
      ]
    });
    
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
});

// Upload product images
router.post(
  '/:id/images',
  [
    protect,
    admin,
    param('id', 'Product ID must be an integer').isInt(),
    // Multer handles file validation (count, type, size) via 'upload' instance
  ],
  upload.array('images', 5), // Multer middleware after validation array
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If only param validation fails, req.files might not exist or be empty
      // If multer validation (fileFilter) fails, it throws an error caught by its own mechanism or general error handler
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const productId = req.params.id; // Already validated
      const product = await Product.findByPk(productId);
    
    if (!product) {
      // Delete uploaded files if product doesn't exist
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const imageData = [];
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/products/`;
    
    for (const file of req.files) {
      // Create relative URL
      const imageUrl = baseUrl + path.basename(file.path);
      
      // Determine if this is the first image (main image)
      const isMainImage = imageData.length === 0;
      
      // Create image record
      const image = await ProductImage.create({
        productId,
        imageUrl,
        isMainImage
      });
      
      imageData.push(image);
      
      // If this is the first image, set it as the main product image
      if (isMainImage) {
        product.imageUrl = imageUrl;
        await product.save();
      }
    }
    
    res.status(201).json({ images: imageData });
  } catch (error) {
    // console.error('Error uploading images:', error); // This will be logged by global handler
    next(error);
  }
});

// Set a product image as main image
router.patch(
  '/:productId/images/:imageId/main',
  [
    protect,
    admin,
    param('productId', 'Product ID must be an integer').isInt(),
    param('imageId', 'Image ID must be an integer').isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productId, imageId } = req.params; // Already validated

      // Check if product and image exist
      const product = await Product.findByPk(productId);
    const image = await ProductImage.findOne({
      where: { id: imageId, productId }
    });
    
    if (!product || !image) {
      return res.status(404).json({ message: 'Product or image not found' });
    }
    
    // Reset all images for this product to not main
    await ProductImage.update(
      { isMainImage: false },
      { where: { productId } }
    );
    
    // Set the selected image as main
    image.isMainImage = true;
    await image.save();
    
    // Update product's main image URL
    product.imageUrl = image.imageUrl;
    await product.save();
    
    res.json({ message: 'Main image updated', image });
  } catch (error) {
    next(error);
  }
});

// Delete a product image
router.delete(
  '/:productId/images/:imageId',
  [
    protect,
    admin,
    param('productId', 'Product ID must be an integer').isInt(),
    param('imageId', 'Image ID must be an integer').isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productId, imageId } = req.params; // Already validated

      const image = await ProductImage.findOne({
        where: { id: imageId, productId }
      });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Extract filename from URL
    const imageUrl = image.imageUrl;
    const filename = imageUrl.split('/').pop();
    const filePath = path.join(__dirname, '../uploads/products', filename);
    
    // Check if this is the main image
    if (image.isMainImage) {
      // Find another image to set as main
      const anotherImage = await ProductImage.findOne({
        where: { 
          productId,
          id: { [Op.ne]: imageId } // not equal to the current image
        }
      });
      
      if (anotherImage) {
        // Set another image as main
        anotherImage.isMainImage = true;
        await anotherImage.save();
        
        // Update product's main image
        const product = await Product.findByPk(productId);
        product.imageUrl = anotherImage.imageUrl;
        await product.save();
      }
    }
    
    // Delete image record from database
    await image.destroy();
    
    // Delete physical file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Image removed' });
  } catch (error) {
    next(error);
  }
});

// Update a product (Admin only)
router.put(
  '/:id',
  [
    protect,
    admin,
    param('id', 'Product ID must be an integer').isInt(),
    body('name', 'Name must be a string').optional().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('price', 'Price must be numeric').optional().isNumeric(),
    body('quantity', 'Stock/Quantity must be an integer').optional().isInt(),
    body('categoryId', 'Category ID must be an integer').optional().isInt(),
    body('locationId', 'Location ID must be an integer').optional().isInt(), // Super admin can change this
    body('configurations', 'Configurations must be an array').optional().isArray(),
    body('configurations.*.name', 'Configuration name must be a non-empty string').if(body('configurations').exists()).optional().not().isEmpty().isString(),
    body('configurations.*.value', 'Configuration value must be a non-empty string').if(body('configurations').exists()).optional().not().isEmpty().isString(),
    body('imageUrl', 'Image URL must be a string').optional().isString(),
    body('inStock', 'In stock must be a boolean').optional().isBoolean(),
    body('isOnPromotion', 'Is on promotion must be a boolean').optional().isBoolean(),
    body('promotionPrice', 'Promotion price must be numeric').optional().isNumeric(),
    body('promotionEndDate', 'Promotion end date must be a valid date').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Vérifier l'accès à l'emplacement
      if (!req.user.isSuperAdmin && req.user.locationId !== product.locationId) {
        return res.status(401).json({ message: "Vous n'êtes pas autorisé à modifier ce produit" });
      }

      const {
        name, description, price, imageUrl, categoryId, quantity,
        inStock, isOnPromotion, promotionPrice, promotionEndDate
        // configurations not handled in original logic
      } = req.body;

      // Si l'utilisateur est un super admin, il peut changer l'emplacement
      if (req.user.isSuperAdmin && req.body.locationId) {
        // Check if locationId is a valid integer if provided (it's optional overall)
        if (Number.isInteger(parseInt(req.body.locationId))) {
           product.locationId = parseInt(req.body.locationId);
        } else if (req.body.locationId !== undefined) { // if it was provided but not valid int
            return res.status(400).json({ errors: [{ type: 'field', msg: 'Location ID must be an integer if provided', path: 'locationId', location: 'body' }] });
        }
      }

      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description; // Added description
      if (price !== undefined) product.price = price;
      if (imageUrl !== undefined) product.imageUrl = imageUrl;
      if (categoryId !== undefined) product.categoryId = categoryId;
    product.price = price || product.price;
    product.imageUrl = imageUrl || product.imageUrl;
    product.categoryId = categoryId || product.categoryId;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.isOnPromotion = isOnPromotion !== undefined ? isOnPromotion : product.isOnPromotion;
    product.promotionPrice = promotionPrice !== undefined ? promotionPrice : product.promotionPrice;
    product.promotionEndDate = promotionEndDate !== undefined ? promotionEndDate : product.promotionEndDate;
    
    await product.save();
    
    // If imageUrl changed, update or create the main product image
    if (imageUrl) {
      const mainImage = await ProductImage.findOne({
        where: { productId: product.id, isMainImage: true }
      });
      
      if (mainImage) {
        mainImage.imageUrl = imageUrl;
        await mainImage.save();
      } else {
        await ProductImage.create({
          productId: product.id,
          imageUrl,
          isMainImage: true
        });
      }
    }
    
    // Charger le produit avec les relations
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, attributes: ['name'] },
        { model: Location, attributes: ['name'] },
        { model: ProductImage, attributes: ['id', 'imageUrl', 'isMainImage'] }
      ]
    });
    
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

// Toggle promotion status (Admin only)
router.patch(
  '/:id/toggle-promotion',
  [
    protect,
    admin,
    param('id', 'Product ID must be an integer').isInt(),
    body('isOnPromotion', 'isOnPromotion must be a boolean').optional().isBoolean(),
    body('promotionPrice', 'Promotion price must be numeric')
      .if(body('isOnPromotion').equals('true')) // if isOnPromotion is true (passed as string from form-data or true as boolean)
      .not().isEmpty().withMessage('Promotion price is required when isOnPromotion is true')
      .isNumeric()
      .bail() // Stop validation if previous checks fail for this field
      .optional(), // Make it optional overall, but required if isOnPromotion is true
    body('promotionEndDate', 'Promotion end date must be a valid date')
      .if(body('isOnPromotion').equals('true'))
      .not().isEmpty().withMessage('Promotion end date is required when isOnPromotion is true')
      .isISO8601().toDate()
      .bail()
      .optional(),
    // Add a custom validator to ensure price and date are not set if isOnPromotion is false
    body().custom((value, { req }) => {
      if (req.body.isOnPromotion === false || req.body.isOnPromotion === 'false') {
        if (req.body.promotionPrice !== undefined && req.body.promotionPrice !== null && req.body.promotionPrice !== '') {
          throw new Error('Promotion price should not be set if isOnPromotion is false.');
        }
        if (req.body.promotionEndDate !== undefined && req.body.promotionEndDate !== null && req.body.promotionEndDate !== '') {
          throw new Error('Promotion end date should not be set if isOnPromotion is false.');
        }
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let { isOnPromotion, promotionPrice, promotionEndDate } = req.body;

      // If isOnPromotion is not explicitly provided, toggle current status
      if (isOnPromotion === undefined) {
        isOnPromotion = !product.isOnPromotion;
      } else {
        // Ensure boolean value if passed as string
        if (typeof isOnPromotion === 'string') {
            isOnPromotion = isOnPromotion.toLowerCase() === 'true';
        }
      }

      product.isOnPromotion = isOnPromotion;
    
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
    next(error);
  }
});

// Delete a product (Admin only)
router.delete(
  '/:id',
  [protect, admin, param('id', 'Product ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{ model: ProductImage }]
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Vérifier l'accès à l'emplacement
    if (!req.user.isSuperAdmin && req.user.locationId !== product.locationId) {
      return res.status(401).json({ message: "Vous n'êtes pas autorisé à supprimer ce produit" });
    }
    
    // Delete all product images from storage
    for (const image of product.ProductImages || []) {
      const imageUrl = image.imageUrl;
      const filename = imageUrl.split('/').pop();
      const filePath = path.join(__dirname, '../uploads/products', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await product.destroy();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
