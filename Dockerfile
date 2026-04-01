# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Generate Prisma client for production
RUN npx prisma generate

# Copy built files
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/src/server.js"]
