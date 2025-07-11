// routes/auditRoutes.js- audit logging API for tracking security and operational events

const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /v1/audit/logs
// List audit logs with pagination and filtering
router.get('/v1/audit/logs', authenticate, authorizeRoles('admin', 'auditor'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, eventType, userId, dateFrom, dateTo } = req.query;
    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (userId) filter.userId = userId;
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AuditLog.countDocuments(filter);

    res.json({ page: Number(page), limit: Number(limit), total, logs });
  } catch (err) {
    next(err);
  }
});

// GET /v1/audit/logs/:id
// Retrieve a single audit entry
router.get('/v1/audit/logs/:id', authenticate, authorizeRoles('admin', 'auditor'), async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log entry not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

// DELETE /v1/audit/logs/:id
// Delete a log entry (admin only)
router.delete('/v1/audit/logs/:id', authenticate, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const deleted = await AuditLog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Log entry not found' });
    res.json({ message: 'Audit log deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /v1/audit/logs
// Internal endpoint for services to log events (secured by service token)
router.post('/v1/audit/logs', async (req, res, next) => {
  try {
    const token = req.headers['x-service-token'];
    if (token !== process.env.SERVICE_AUTH_TOKEN) {
      return res.status(401).json({ error: 'Invalid service token' });
    }
    const { userId, eventType, details } = req.body;
    const entry = await AuditLog.create({ userId, eventType, details });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
