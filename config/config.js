/**
 * config.js
 *
 * Centralized configuration - All settings are driven by environment variables with sensible defaults.
 */

require('dotenv').config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

module.exports = {
  app: {
    port: parseNumber(process.env.PORT, 3000),
    env: process.env.NODE_ENV || 'development'
  },

  db: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parseNumber(process.env.RATE_LIMIT_MAX, 100),
    message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests, please try again later.'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    cookieExpireDays: parseNumber(process.env.COOKIE_EXPIRE_DAYS, 7)
  },

  swagger: {
    docsPath: process.env.SWAGGER_DOCS_PATH || '/docs',
    yamlPath: process.env.SWAGGER_YAML_PATH || 'docs/openapi.yaml'
  },

  prometheus: {
    httpDurationBuckets: (process.env.PROM_HTTP_BUCKETS || '50,100,200,300,400,500,1000')
      .split(',')
      .map((v) => parseNumber(v.trim(), 0))
  }
};
