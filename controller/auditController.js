// controllers/auditController.js
// Audit controller: manages audit log operations including listing, retrieval, deletion, and recording of events.

const AuditLog = require('../models/AuditLog');

/**
 * List audit logs with filters.
 */
exports.listLogs = async (req, res, next) => {
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
};

/**
 * Get a single audit log entry.
 */
exports.getLogById = async (req, res, next) => {
  try {
    const entry = await AuditLog.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Audit entry not found.' });
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an audit log entry.
 */
exports.deleteLog = async (req, res, next) => {
  try {
    const removed = await AuditLog.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Audit entry not found.' });
    }
    res.json({ message: 'Audit entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a new audit log entry.
 */
exports.recordLog = async (req, res, next) => {
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
};
