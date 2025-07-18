# Accept environment file as build argument
ARG ENV_FILE=env.example

#############################
# Stage 1: Dependencies
#############################
FROM node:20-alpine AS deps
ARG ENV_FILE=env.example
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev --prefer-offline --no-audit

#############################
# Stage 2: Builder
#############################
FROM node:20-alpine AS builder
ARG ENV_FILE=env.example
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY ${ENV_FILE} .env
COPY . .

# Generate Prisma client and build the app with caching
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npx prisma generate \
  && npm run build

# Only keep linux-musl-openssl-3.0.x engine
RUN rm -rf \
  node_modules/@prisma/engines/*-darwin-* \
  node_modules/@prisma/engines/*-windows-* \
  node_modules/@prisma/engines/introspection-* \
  node_modules/@prisma/engines/*-debian-* \
  node_modules/@prisma/engines/*-linux-musl-openssl-1.1.x \
  || true

# Remove sourcemaps and docs to slim final image
RUN find node_modules -name "*.map" -type f -delete \
  && find node_modules -type d -name "docs" -exec rm -rf {} +

#############################
# Stage 3: Production
#############################
FROM node:20-alpine AS production
WORKDIR /app

# Add wget for healthchecks and create non-root user.
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app and static assets
COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/scripts ./scripts

# Copy minimal Prisma and runtime dependencies
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/jiti ./node_modules/jiti
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/tslib ./node_modules/tslib
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/.bin ./node_modules/.bin

COPY --chown=nextjs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check using wget.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1


CMD ["sh", "-c", "npx prisma migrate deploy && node server.js --hostname 0.0.0.0"]
