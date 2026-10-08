# Syntax: build from the repo root so workspace deps resolve.
#   docker build -f apps/web/Dockerfile -t time-arena-web .
#   (docker compose build web does this automatically)

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

COPY . .

# Baked in at build time (Vite). Empty VITE_API_URL keeps relative /api
# calls, which nginx proxies to the api service (see nginx.conf).
ARG VITE_API_URL=""
ARG VITE_WEB_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEB_URL=$VITE_WEB_URL
RUN bunx turbo build --filter=@repo/web...

FROM nginx:alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
