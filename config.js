// Centralized configuration 

require('dotenv').config();

module.exports = {
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
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
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests, please try again later.'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    cookieExpireDays: parseInt(process.env.COOKIE_EXPIRE_DAYS, 10) || 7
  },

  swagger: {
    docsPath: process.env.SWAGGER_DOCS_PATH || '/docs',
    yamlPath: process.env.SWAGGER_YAML_PATH || 'docs/openapi.yaml'
  },

  prometheus: {
    httpDurationBuckets: (process.env.PROM_HTTP_BUCKETS || '50,100,200,300,400,500,1000')
      .split(',')
      .map(Number)
  }
};
