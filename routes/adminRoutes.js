// routes/adminRoutes.js
// Administrative endpoints for managing users and roles in the enterprise API auth service

const express = require('express');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /v1/admin/users
 * Returns a paginated list of all users (excluding sensitive fields).
 * Access: Admin users only.
 */
router.get(
  '/v1/admin/users',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 100 } = req.query;
      const skip = (page - 1) * limit;
      const users = await User.find()
        .select('id email roles active createdAt')
        .skip(Number(skip))
        .limit(Number(limit));
      const total = await User.countDocuments();
      res.json({ page: Number(page), limit: Number(limit), total, users });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /v1/admin/users/:id/roles
 * Updates the role assignments for a given user.
 * Access: Admin users only.
 */
router.patch(
  '/v1/admin/users/:id/roles',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { roles } = req.body;
      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: 'Roles must be a non-empty array.' });
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { roles },
        { new: true, runValidators: true }
      ).select('id email roles active');

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /v1/admin/users/:id/status
 * Toggles the active status of a user account.
 * Access: Admin users only.
 */
router.patch(
  '/v1/admin/users/:id/status',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const { active } = req.body;
      if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'Active must be a boolean.' });
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { active },
        { new: true, runValidators: true }
      ).select('id email roles active');

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
