/**
 * Health check endpoints for Kubernetes probes.
 */
exports.liveness = (req, res) => {
  res.status(200).json({ status: 'OK' });
};

exports.readiness = (req, res) => {
  const dbReady = req.app.locals.dbConnected;
  res.status(dbReady ? 200 : 503).json({ database: dbReady });
};
