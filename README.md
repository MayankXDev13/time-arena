# Time Arena

## Setup

```bash
cp .env.example .env
```

Fill in `.env`:

```bash
# Generate secret if you haven't already
# openssl rand -base64 32
BETTER_AUTH_SECRET=
DATABASE_URL= # Neon pooled connection string
DIRECT_URL= # Neon direct connection string (migrations)

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Database

```bash
bun run db:generate # create migration from schema
bun run db:migrate # apply migrations to Neon
```

## Develop

```bash
bun run dev
bun run test
bun run build
```
