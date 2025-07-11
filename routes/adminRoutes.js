// routes/adminRoutes.js
const express = require('express');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// List all users (admin only)
router.get(
  '/v1/admin/users',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

// Update user roles (admin only)
router.patch(
  '/v1/admin/users/:id/roles',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { roles } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { roles },
        { new: true }
      ).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// Deactivate/reactivate user (admin only)
router.patch(
  '/v1/admin/users/:id/status',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { active } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { active },
        { new: true }
      ).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
