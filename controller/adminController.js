// controllers/adminController.js
// Admin controller: provides administrative operations for listing users, updating roles, and toggling account status.

const User = require('../models/User');

/**
 * List users with pagination.
 */
exports.listUsers = async (req, res, next) => {
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
};

/**
 * Update roles for a user.
 */
exports.updateRoles = async (req, res, next) => {
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
};

/**
 * Toggle activation status of a user.
 */
exports.toggleStatus = async (req, res, next) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'Active must be boolean.' });
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
};
