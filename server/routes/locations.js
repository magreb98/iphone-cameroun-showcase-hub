
const { Router } = require('express');
const Location = require('../models/Location');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');
const { body, param, validationResult } = require('express-validator');

const router = Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

// Get a single location
router.get(
  '/:id',
  [param('id', 'Location ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const location = await Location.findByPk(req.params.id);

      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
    
    res.json(location);
  } catch (error) {
    next(error);
  }
});

// Create a location (Super Admin only)
router.post(
  '/',
  [
    protect,
    superAdmin,
    body('name', 'Name is required and must be a string').not().isEmpty().isString(),
    body('address', 'Address must be a string').optional().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('imageUrl', 'Image URL must be a valid URL').optional().isURL(),
    body('phone', 'Phone must be a string').optional().isString(),
    body('email', 'Email must be a valid email address').optional().isEmail(),
    body('whatsappNumber', 'WhatsApp number must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, address, description, imageUrl, phone, email, whatsappNumber } = req.body;

      const location = await Location.create({
        name,
        address,
        description,
        imageUrl,
        phone,
        email,
        whatsappNumber,
      });

      res.status(201).json(location);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Assuming 'name' or 'email' might be unique
        return res.status(400).json({ message: 'Location name or email already exists.' });
      }
      next(error);
    }
  }
);

// Update a location (Super Admin only)
router.put(
  '/:id',
  [
    protect,
    superAdmin,
    param('id', 'Location ID must be an integer').isInt(),
    body('name', 'Name must be a non-empty string if provided').optional().not().isEmpty().isString(),
    body('address', 'Address must be a string').optional().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('imageUrl', 'Image URL must be a valid URL').optional().isURL(),
    body('phone', 'Phone must be a string').optional().isString(),
    body('email', 'Email must be a valid email address').optional().isEmail(),
    body('whatsappNumber', 'WhatsApp number must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const location = await Location.findByPk(req.params.id);

      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      const { name, address, description, imageUrl, phone, email, whatsappNumber } = req.body;

      if (name !== undefined) location.name = name;
      if (address !== undefined) location.address = address;
      if (description !== undefined) location.description = description;
      if (imageUrl !== undefined) location.imageUrl = imageUrl;
      if (phone !== undefined) location.phone = phone;
      if (email !== undefined) location.email = email;
      if (whatsappNumber !== undefined) location.whatsappNumber = whatsappNumber;

      await location.save();

      res.json(location);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Location name or email already exists.' });
      }
      next(error);
    }
  }
);

// Delete a location (Super Admin only)
router.delete(
  '/:id',
  [protect, superAdmin, param('id', 'Location ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const location = await Location.findByPk(req.params.id);

      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
    
    await location.destroy();
    
    res.json({ message: 'Location removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
