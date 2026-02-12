# ============================================
# Vite Gourmand - Production Dockerfile
# ============================================
# Multi-stage build for NestJS backend + Vite frontend

# Stage 1: Build Backend
FROM node:22-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Run unit tests at build time (no DB needed) and save results
# E2E tests will run live in production where the DB is available
RUN node --max-old-space-size=384 --localstorage-file=/tmp/jest-localstorage \
    node_modules/.bin/jest --runInBand --json \
    --outputFile=test-results-unit.json --forceExit || true

# Stage 2: Build Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 3: Production Image
FROM node:22-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y curl && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001


# Copy backend built files
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/prisma ./prisma

# Copy source and test files for live test execution in production
COPY --from=backend-builder /app/backend/src ./src
COPY --from=backend-builder /app/backend/test ./test
COPY --from=backend-builder /app/backend/tsconfig.json ./tsconfig.json
COPY --from=backend-builder /app/backend/tsconfig.build.json ./tsconfig.build.json

# Copy pre-built unit test results (startup fallback)
COPY --from=backend-builder /app/backend/test-results-unit.json ./test-results-unit.json

# Copy frontend built files to be served statically
COPY --from=frontend-builder /app/frontend/dist ./public

# Set ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api || exit 1

# Start the application (NestJS outputs to dist/src/main.js)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
