// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { promisify } = require('util');
const config = require('../config');

const router = express.Router();

// Register
router.post('/v1/auth/register', async (req, res, next) => {
  try {
    const { email, password, roles = ['user'] } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashed, roles });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/v1/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user.id, roles: user.roles }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    res.cookie('jid', token, {
      httpOnly: true,
      maxAge: config.jwt.cookieExpireDays * 24 * 60 * 60 * 1000,
      secure: config.app.env === 'production',
      sameSite: 'lax'
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Refresh Token
router.post('/v1/auth/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.jid || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const payload = await promisify(jwt.verify)(token, config.jwt.secret);
    const newToken = jwt.sign({ sub: payload.sub, roles: payload.roles }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    res.cookie('jid', newToken, { httpOnly: true });
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/v1/auth/logout', (req, res) => {
  res.clearCookie('jid').status(200).json({ message: 'Logged out' });
});

module.exports = router;
