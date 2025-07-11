// scripts/metrics-server.js
// Hosts Prometheus metrics on a dedicated port for external monitoring

const express = require('express');
const promClient = require('prom-client');

// Create a minimal server to expose Prometheus metrics
const app = express();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Start metrics server on specified port (default: 9100)
const PORT = process.env.METRICS_PORT || 9100;
app.listen(PORT, () => {
  console.log(`Metrics server running on port ${PORT}`);
});
