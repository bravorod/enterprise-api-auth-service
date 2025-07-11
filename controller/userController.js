const bcrypt = require('bcrypt');
const User = require('../models/User');

/**
 * Get profile of the authenticated user.
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile of the authenticated user.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }
    const user = await User.findByIdAndUpdate(req.user.sub, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};
