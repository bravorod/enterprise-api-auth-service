// Main application entrypoint with advanced configurations, security, monitoring, and dev features

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const promClient = require('prom-client');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

// App initalization and configuration
const app = express();
app.use(helmet());
app.use(morgan('combined'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: 'Too many requests, please try again later.'
}));

app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parse URL-encoded
app.use(cookieParser());

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Prometheus metrics 
promClient.collectDefaultMetrics();
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 400, 500, 1000]
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Request timing middleware
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.originalUrl, status_code: res.statusCode });
  });
  next();
});

// Swagger API 
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const booksRouter = require('./routes/booksRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/v1/books', booksRouter);
app.use('/v1/users', userRouter);

// Health check endpoints
app.get('/healthz', (req, res) => res.status(200).send({ status: 'OK' }));
app.get('/readyz', (req, res) => res.status(200).send({ database: mongoose.connection.readyState }));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

const shutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed');
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shut down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
