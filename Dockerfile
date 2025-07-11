# Dockerfile
# Multi-stage build for Enterprise API Auth Service

FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Setup production image
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/main.js ./main.js
COPY --from=builder /app/config.js ./config.js
COPY --from=builder /app/config ./config
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/model ./model
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/rbacConfig.js ./rbacConfig.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose application port
EXPOSE 5000

# Launch the service
CMD ["node", "main.js"]
