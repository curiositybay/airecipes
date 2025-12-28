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
# Copy source code first (excluding .env files via .dockerignore)
COPY . .
# Copy production env file LAST to ensure it's not overwritten by any local .env
# This ensures NEXT_PUBLIC_* variables are set correctly for the build
COPY ${ENV_FILE} .env

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

# Ensure script files are executable
RUN chmod +x scripts/*.js

# Copy Prisma core packages
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/.bin ./node_modules/.bin

# Copy all Prisma dependencies automatically (nested + known fallback list)
RUN --mount=from=builder,source=/app/node_modules,target=/src/node_modules \
    mkdir -p ./node_modules && \
    # Copy nested dependencies from prisma packages (where npm installs them)
    for pkg_dir in /src/node_modules/prisma/node_modules /src/node_modules/@prisma/dev/node_modules /src/node_modules/@prisma/config/node_modules; do \
      if [ -d "$pkg_dir" ]; then \
        cp -r "$pkg_dir"/* ./node_modules/ 2>/dev/null || true; \
      fi; \
    done && \
    # Copy known top-level dependencies as fallback (update this list if Prisma adds new deps)
    for pkg in jiti tslib dotenv valibot pathe zeptomatch grammex get-port-please remeda std-env proper-lockfile graceful-fs retry effect fast-check c12 perfect-debounce exsolve ohash defu confbox chokidar giget pkg-types rc9 destr deepmerge-ts tsx esbuild postgres-array pg get-tsconfig resolve-pkg-maps empathic; do \
      if [ -d "/src/node_modules/$pkg" ] && [ ! -d "./node_modules/$pkg" ]; then \
        cp -r "/src/node_modules/$pkg" "./node_modules/$pkg" 2>/dev/null || true; \
      fi; \
    done

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


CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node server.js --hostname 0.0.0.0"]
