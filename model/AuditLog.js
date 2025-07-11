// models/AuditLog.js
// Mongoose schema for enterprise-grade audit logging

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * AuditLogSchema defines the structure of an audit log entry.
 * Captures user actions, system events, and security-related occurrences.
 */
const AuditLogSchema = new Schema(
  {
    /** ID of the user performing the action */
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },

    /** Type/category of the event (e.g., 'LOGIN', 'DATA_ACCESS', 'CONFIG_CHANGE') */
    eventType: {
      type: String,
      required: true,
      enum: ['LOGIN', 'LOGOUT', 'DATA_READ', 'DATA_WRITE', 'CONFIG_CHANGE', 'ERROR', 'SYSTEM'],
      index: true,
    },

    /** Detailed description or payload of the event */
    details: {
      type: Schema.Types.Mixed,
      required: true,
    },

    /** Source identifier (e.g., service name or microservice ID) */
    source: {
      type: String,
      default: 'auth-service',
      index: true,
    },

    /** IP address of the request origin */
    ipAddress: {
      type: String,
      required: false,
    },

    /** Unique request ID for tracing correlation */
    requestId: {
      type: String,
      required: false,
      index: true,
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: { createdAt: 'timestamp', updatedAt: 'updatedAt' },
    collection: 'audit_logs',
  }
);

/**
 * Instance method to mask sensitive fields in details
 */
AuditLogSchema.methods.maskSensitive = function (fields = []) {
  fields.forEach((field) => {
    if (this.details[field]) {
      this.details[field] = '***';
    }
  });
  return this;
};

/**
 * Static method to write a new audit entry
 */
AuditLogSchema.statics.record = async function ({ userId, eventType, details, source, ipAddress, requestId }) {
  return this.create({ userId, eventType, details, source, ipAddress, requestId });
};

// Compound index to optimize common queries
AuditLogSchema.index({ eventType: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
