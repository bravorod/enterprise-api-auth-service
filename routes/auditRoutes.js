// routes/auditRoutes.js
// Endpoints for audit log management in the enterprise API auth service

const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');

/**
 * GET /v1/audit/logs
 * Returns a paginated list of audit entries with optional filters (eventType, userId, date range).
 * Access: Admin and auditor roles.
 */
router.get(
  '/v1/audit/logs',
  authenticate,
  authorizeRoles('admin', 'auditor'),
  async (req, res, next) => {
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
      const skip = (page - 1) * limit;

      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(Number(skip))
        .limit(Number(limit));

      const total = await AuditLog.countDocuments(filter);
      res.json({ page: Number(page), limit: Number(limit), total, logs });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /v1/audit/logs/:id
 * Retrieves a single audit entry by its ID.
 * Access: Admin and auditor roles.
 */
router.get(
  '/v1/audit/logs/:id',
  authenticate,
  authorizeRoles('admin', 'auditor'),
  async (req, res, next) => {
    try {
      const entry = await AuditLog.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: 'Audit entry not found' });
      }
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /v1/audit/logs/:id
 * Deletes a specific audit entry.
 * Access: Admin role only.
 */
router.delete(
  '/v1/audit/logs/:id',
  authenticate,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const removed = await AuditLog.findByIdAndDelete(req.params.id);
      if (!removed) {
        return res.status(404).json({ error: 'Audit entry not found' });
      }
      res.json({ message: 'Audit entry deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /v1/audit/logs
 * Records a new audit entry from authorized services.
 * Access: Service-to-service via x-service-token.
 */
router.post(
  '/v1/audit/logs',
  async (req, res, next) => {
    try {
      const token = req.get('x-service-token');
      if (token !== process.env.SERVICE_AUTH_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized service token' });
      }
      const { userId, eventType, details } = req.body;
      const newEntry = await AuditLog.create({ userId, eventType, details });
      res.status(201).json(newEntry);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
