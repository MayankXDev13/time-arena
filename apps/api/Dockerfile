# Syntax: build from the repo root so workspace deps resolve.
#   docker build -f apps/api/Dockerfile -t time-arena-api .
#   (docker compose build api does this automatically)

FROM oven/bun:1.4.0 AS build
WORKDIR /app

# Install workspace deps first for better layer caching.
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/legacy/package.json apps/legacy/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/types/package.json packages/types/package.json
RUN bun install --frozen-lockfile

# Build @repo/api plus its workspace dependencies (@repo/db, @repo/types).
COPY . .
RUN bunx turbo build --filter=@repo/api...

FROM oven/bun:1.4.0 AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/db/package.json ./packages/db/package.json
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/drizzle ./packages/db/drizzle
COPY --from=build /app/packages/types/package.json ./packages/types/package.json
COPY --from=build /app/packages/types/dist ./packages/types/dist

USER bun
EXPOSE 3000
CMD ["bun", "apps/api/dist/index.js"]
