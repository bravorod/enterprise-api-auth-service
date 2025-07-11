// middleware/auth.js
// Authentication & authorization middleware 

const jwt       = require('jsonwebtoken');
const { promisify } = require('util');
const config    = require('../config/config');
const { can }   = require('../config/rbacConfig');

/**
 * Verify JWT, attach decoded payload to req.user
 */
exports.authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies.jid ||
      req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Check that user has at least one of the allowed roles *and*
 * is permitted to perform this HTTP method on the current resource.
 */
exports.authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const method   = req.method.toLowerCase();               // e.g., 'get', 'post'
  const resource = req.baseUrl.split('/').pop();           // e.g., 'users', 'auditLogs'

  const permitted = req.user.roles.some(role =>
    allowedRoles.includes(role) && can(role, resource, method)
  );

  if (!permitted) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
