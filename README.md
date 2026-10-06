# Time Arena

Focus timer and time-tracking app. Start work/break sessions, organize them
by category, and track streaks, stats, and contribution history.

## Tech stack

- Next.js 16 + React 19 + Tailwind CSS 4
- Drizzle ORM + Neon Postgres
- better-auth (email/password + Google + GitHub)
- TanStack Query + Zustand
- Vitest

## Setup

```bash
cp .env.example .env
bun install
```

Fill in `.env`:

```bash
# Generate secret if you haven't already
# openssl rand -base64 32
BETTER_AUTH_SECRET=
DATABASE_URL= # Neon pooled connection string (runtime)
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

Auth tables (`user`, `session`, `account`, `verification`) are generated
from the better-auth config; app tables live in `db/app-schema.ts`.

```bash
# keep the CLI major.minor in sync with the better-auth version in package.json
bunx @better-auth/cli@1.4 generate --config ./lib/auth.ts --output ./db/auth-schema.ts -y
bun run db:generate # create migration from schema
bun run db:migrate # apply migrations to Neon
```

## Develop

```bash
bun run dev # start dev server
bun run test # vitest (DB integration tests hit Neon)
bun run build # production build
bun run lint # eslint
```

## Project layout

- `app/` — routes, including `app/api/*` REST handlers
- `lib/auth.ts` — better-auth server config
- `lib/queries/` — tested drizzle queries (sessions, categories, users)
- `lib/api.ts` — typed fetch client used by the frontend
- `db/` — drizzle schemas + client (`db/index.ts`)
- `drizzle/` — generated SQL migrations
- `hooks/`, `stores/`, `components/` — UI state and views
