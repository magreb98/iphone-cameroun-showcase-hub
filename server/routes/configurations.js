
const { Router } = require('express');
const Configuration = require('../models/Configuration');
const { protect, admin } = require('../middleware/authMiddleware');
const { body, param, validationResult } = require('express-validator');

const router = Router();

// Get all configurations
router.get('/', protect, admin, async (req, res) => {
  try {
    const configurations = await Configuration.findAll();
    res.json(configurations);
  } catch (error) {
    next(error);
  }
});

// Get a configuration by key
router.get(
  '/:key',
  [param('key', 'Config key must be a non-empty string').not().isEmpty().isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const configuration = await Configuration.findOne({
        where: { configKey: req.params.key },
      });
    
    if (!configuration) {
      // Renvoyer un objet vide mais pas d'erreur 404, laissez le client gérer les valeurs par défaut
      return res.json({ 
        configKey: req.params.key,
        configValue: "",
        description: "Configuration not found" 
      });
    }
    
    res.json(configuration);
  } catch (error) {
    next(error);
  }
});

// Create or update a configuration (Admin only)
router.post(
  '/',
  [
    protect,
    admin,
    body('configKey', 'configKey is required and must be a string').not().isEmpty().isString(),
    body('configValue', 'configValue must be a string').isString(), // Allow empty string
    body('description', 'Description must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { configKey, configValue, description } = req.body;

      // Check if configuration already exists
      let configuration = await Configuration.findOne({
        where: { configKey },
      });
    
    if (configuration) {
      // Update existing configuration
      configuration.configValue = configValue;
      if (description) configuration.description = description;
      await configuration.save();
    } else {
      // Create new configuration
      configuration = await Configuration.create({
        configKey,
        configValue,
        description
      });
    }
    
    res.status(201).json(configuration);
  } catch (error) {
    next(error);
  }
});

// Delete a configuration (Admin only)
router.delete(
  '/:id',
  [protect, admin, param('id', 'Configuration ID must be an integer').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const configuration = await Configuration.findByPk(req.params.id);

      if (!configuration) {
        return res.status(404).json({ message: 'Configuration not found' });
      }
    
    await configuration.destroy();
    
    res.json({ message: 'Configuration removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
