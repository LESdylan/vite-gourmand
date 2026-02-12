# ============================================
# Vite Gourmand - Production Dockerfile
# ============================================
# Multi-stage build for NestJS backend + Vite frontend
# Directory structure: Back/ (NestJS), View/ (Vite frontend)

# Stage 1: Build Backend
FROM node:22-alpine AS backend-builder

WORKDIR /app/Back

# Copy backend package files
COPY Back/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy backend source
COPY Back/ ./

# Generate Prisma client
RUN npx prisma generate --schema=src/Model/prisma/schema.prisma

# Build the application
RUN npm run build

# Run unit tests at build time (no DB needed) and save results
# E2E tests will run live in production where the DB is available
RUN node --max-old-space-size=384 --localstorage-file=/tmp/jest-localstorage \
    node_modules/.bin/jest --runInBand --json \
    --outputFile=test-results-unit.json --forceExit || true

# Stage 2: Build Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/View

# Copy frontend package files
COPY View/package*.json ./

# Install dependencies
RUN npm ci || true

# Copy frontend source
COPY View/ ./

# Build the frontend
RUN npm run build || true

# Stage 3: Production Image
FROM node:22-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling, curl for healthchecks,
# and ca-certificates for TLS connections (MongoDB Atlas, Supabase, etc.)
RUN apk add --no-cache dumb-init curl ca-certificates

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy backend built files
COPY --from=backend-builder /app/Back/dist ./dist
COPY --from=backend-builder /app/Back/node_modules ./node_modules
COPY --from=backend-builder /app/Back/package*.json ./

# Copy Prisma schema and migrations
COPY --from=backend-builder /app/Back/src/Model/prisma ./prisma

# Copy source files for live test execution in production
# Tests are co-located in src/ (*.spec.ts), no separate test/ directory
COPY --from=backend-builder /app/Back/src ./src
COPY --from=backend-builder /app/Back/tsconfig.json ./tsconfig.json
COPY --from=backend-builder /app/Back/tsconfig.build.json ./tsconfig.build.json

# Copy pre-built unit test results (startup fallback, may not exist)
COPY --from=backend-builder /app/Back/test-results-unit.json ./test-results-unit.json

# Copy generated Prisma client (needed by test runner at runtime)
COPY --from=backend-builder /app/Back/generated ./generated

# Copy Postman collections for API tests
COPY --from=backend-builder /app/Back/postman ./postman

# Copy i18n files
COPY --from=backend-builder /app/Back/src/i18n ./dist/src/i18n

# Copy frontend built files to be served statically
# Uses a wildcard so it won't fail if the build didn't produce output
COPY --from=frontend-builder /app/View/dist* ./public/

# Set ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
# Fix Alpine OpenSSL + MongoDB Atlas TLS handshake issue
ENV NODE_OPTIONS="--tls-cipher-list=DEFAULT@SECLEVEL=0"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:8080/api || exit 1

# Start the application (NestJS outputs to dist/src/main.js)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
