#### BASE
# Node 22+ required: workspace pnpm uses built-in `node:sqlite` (unavailable on Node 20).
# Debian (not Alpine): Prisma's default linux-musl engine needs libssl 1.1, which current Alpine
# does not ship; bookworm's OpenSSL 3 matches Prisma's debian-openssl-3 query engines.
FROM node:22-bookworm-slim AS base

ENV MOON_TOOLCHAIN_FORCE_GLOBALS=true

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

# Install moon binary
RUN npm install -g @moonrepo/cli@1.28.3
RUN npm install -g pnpm@9

#### SKELETON
FROM base AS skeleton

# Copy entire repository and scaffold
COPY . .

# Copy the minimum of files necessary for installing dependencies
RUN moon docker scaffold cli

#### BUILD
FROM base AS build

# Copy toolchain
COPY --from=skeleton /root/.proto /root/.proto

# Copy workspace skeleton
COPY --from=skeleton /app/.moon/docker/workspace .
# Copy Prisma schema
COPY --from=skeleton /app/.moon/docker/sources/packages/prisma/src/schema.prisma ./packages/prisma/src/schema.prisma

# Install toolchain and dependencies
RUN moon docker setup

# Copy source files
COPY --from=skeleton /app/.moon/docker/sources .

# Regenerate Prisma client + zod in the prisma package context (PATH includes zod-prisma-types).
RUN DATABASE_URL="file:/tmp/prisma-generate.db" moon run prisma:generate

# Build something (optional)
RUN moon run cli:build

# Remove unneeded files and folders
RUN moon docker prune

##### RUNNER
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

# Default SQLite path (matches docker-compose / entrypoint). Override in Railway if needed.
ENV DATABASE_URL=file:/app/data/dev.db
# Railway (and Docker) must accept external connections — not 127.0.0.1 only.
ENV HOST=0.0.0.0

COPY --from=build /app/apps/cli ./apps/cli
COPY --from=build /app/node_modules ./node_modules

# Copy Prisma schema, migrations, and seed script
COPY --from=build /app/packages/prisma/src/schema.prisma ./packages/prisma/src/schema.prisma
COPY --from=build /app/packages/prisma/src/migrations ./packages/prisma/src/migrations
COPY --from=build /app/packages/prisma/seed.mjs ./packages/prisma/seed.mjs

# Copy the entrypoint script to run migrations before starting the app
COPY bin/docker-entry.sh /app/bin/docker-entry.sh
RUN chmod +x /app/bin/docker-entry.sh
ENTRYPOINT ["/app/bin/docker-entry.sh"]

WORKDIR /app/apps/cli
CMD node dist/standalone.mjs
