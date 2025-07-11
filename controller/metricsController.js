// controllers/metricsController.js
// Metrics controller: exposes Prometheus metrics for monitoring and observability.

const promClient = require('prom-client');

/**
 * Expose Prometheus metrics.
 */
exports.getMetrics = async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
};
