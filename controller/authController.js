const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const User = require('../models/User');
const config = require('../config');

/**
 * Register a new user account.
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, roles = ['user'] } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashedPassword, roles });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user and issue JWT.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const payload = { sub: user.id, roles: user.roles };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    res.cookie('jid', token, {
      httpOnly: true,
      secure: config.app.env === 'production',
      sameSite: 'lax',
      maxAge: config.jwt.cookieExpireDays * 24 * 60 * 60 * 1000
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh JWT token.
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jid || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
    const newToken = jwt.sign({ sub: decoded.sub, roles: decoded.roles }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    res.cookie('jid', newToken, {
      httpOnly: true,
      secure: config.app.env === 'production',
      sameSite: 'lax',
      maxAge: config.jwt.cookieExpireDays * 24 * 60 * 60 * 1000
    });
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user by clearing cookie.
 */
exports.logout = (req, res) => {
  res.clearCookie('jid');
  res.status(200).json({ message: 'Logged out successfully' });
};
