FROM oven/bun:1.3-slim AS base

# STAGE 1: DEPS
FROM base AS deps
LABEL author=gab-cat
LABEL last_updated="2025-11-01"

WORKDIR /app

# Set bun configuration for Docker builds to maximize parallelism
ENV BUN_INSTALL_TIMEOUT=300000
ENV BUN_CONFIG_MAX_HTTP_REQUESTS=64
ENV BUN_CONFIG_INSTALL_MAX_NETWORK_CONNECTIONS=128

# Copy package files and install dependencies
COPY bun.lock package.json ./
# RUN apk add --no-cache libc6-compat
RUN bun install --frozen-lockfile --concurrent-scripts=8


# STAGE 2: BUILD
FROM base AS builder
LABEL author=gab-cat

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
# Load environment variables and build Next.js app
# Note: Convex deployment should be done separately in CI/CD, not during Docker build
RUN bunx dotenv-cli -e .env -- bun --bun run build



# STAGE 3: Runner
FROM base AS runner
LABEL author=gab-cat

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV APP_ENV=production

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --no-create-home nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ensure environment file and app directory are owned by nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

CMD ["bun", "--bun", "server.js"]


