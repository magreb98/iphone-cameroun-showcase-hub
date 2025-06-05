
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Admin login
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
    
    if (user && await user.matchPassword(password)) {
      res.json({
        token: generateToken(user.id),
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          locationId: user.locationId,
          name: user.name,
          whatsappNumber: user.whatsappNumber
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put(
  '/profile',
  [
    protect,
    body('name', 'Name must be a string').optional().isString(),
    body('email', 'Please include a valid email').optional().isEmail(),
    body('whatsappNumber', 'WhatsApp number must be a string').optional().isString(),
    body('newPassword', 'New password must be at least 6 characters')
      .optional()
      .isLength({ min: 6 }),
    body('currentPassword').custom((value, { req }) => {
      if (req.body.newPassword && !value) {
        throw new Error('Current password is required when setting a new password');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, currentPassword, newPassword, whatsappNumber } = req.body;

      const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set new password' });
      }
      
      const isCurrentPasswordValid = await user.matchPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      user.password = newPassword;
    }
    
    // Update other fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        whatsappNumber: user.whatsappNumber,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        locationId: user.locationId
      }
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post(
  '/forgot-password',
  [body('whatsappNumber', 'WhatsApp number is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { whatsappNumber } = req.body;

      const user = await User.findOne({ where: { whatsappNumber } });
    
    if (!user) {
      return res.status(404).json({ message: 'No user found with this WhatsApp number' });
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.resetPasswordCode = verificationCode;
    user.resetPasswordExpires = expirationTime;
    await user.save();
    
    // TODO: CRITICAL - Integrate with a proper WhatsApp API to send the verification code.
    // The console.log below is for debugging ONLY and MUST be removed in a production environment.
    // Exposing verification codes via console logs or direct API responses is a security risk.
    console.log(`Verification code for ${whatsappNumber}: ${verificationCode}`);
    
    res.json({
      message: 'Verification code sent to your WhatsApp'
      // The verificationCode field has been removed from this response for security reasons.
      // Ensure the code is sent via a secure channel (e.g., WhatsApp API).
    });
  } catch (error) {
    next(error);
  }
});

// Verify reset code
router.post(
  '/verify-reset-code',
  [
    body('whatsappNumber', 'WhatsApp number is required').not().isEmpty(),
    body('code', 'Code is required and must be a 6-digit number').not().isEmpty().isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { whatsappNumber, code } = req.body;

      const user = await User.findOne({
      where: {
        whatsappNumber,
        resetPasswordCode: code,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    res.json({ message: 'Code verified successfully', userId: user.id });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post(
  '/reset-password',
  [
    body('whatsappNumber', 'WhatsApp number is required').not().isEmpty(),
    body('code', 'Code is required and must be a 6-digit number').not().isEmpty().isLength({ min: 6, max: 6 }).isNumeric(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { whatsappNumber, code, newPassword } = req.body;

      const user = await User.findOne({
      where: {
        whatsappNumber,
        resetPasswordCode: code,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Register a new user (protected, only admins can create)
router.post(
  '/register',
  [
    protect,
    admin,
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('isAdmin', 'isAdmin must be a boolean').optional().isBoolean(),
    body('isSuperAdmin', 'isSuperAdmin must be a boolean').optional().isBoolean(),
    body('locationId', 'locationId must be an integer').optional().isInt(),
    body('name', 'Name must be a string').optional().isString(),
    body('whatsappNumber', 'WhatsApp number must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, isAdmin, isSuperAdmin, locationId, name, whatsappNumber } = req.body;

      const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      email,
      password,
      isAdmin: isAdmin || false,
      isSuperAdmin: isSuperAdmin || false,
      locationId: locationId || null,
      name: name || null,
      whatsappNumber: whatsappNumber || null
    });
    
    if (user) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        locationId: user.locationId,
        name: user.name,
        whatsappNumber: user.whatsappNumber
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put(
  '/users/:id',
  [
    protect,
    admin,
    body('email', 'Please include a valid email').optional().isEmail(),
    body('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
    body('isAdmin', 'isAdmin must be a boolean').optional().isBoolean(),
    body('isSuperAdmin', 'isSuperAdmin must be a boolean').optional().isBoolean(),
    body('locationId', 'locationId must be an integer').optional().isInt(),
    body('name', 'Name must be a string').optional().isString(),
    body('whatsappNumber', 'WhatsApp number must be a string').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { email, password, isAdmin, isSuperAdmin, locationId, name, whatsappNumber } = req.body;

      if (email) user.email = email;
    if (password) user.password = password;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (isSuperAdmin !== undefined) user.isSuperAdmin = isSuperAdmin;
    if (locationId !== undefined) user.locationId = locationId;
    if (name !== undefined) user.name = name;
    if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
    
    await user.save();
    
    res.json({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      locationId: user.locationId,
      name: user.name,
      whatsappNumber: user.whatsappNumber
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    res.json({ message: 'User removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
