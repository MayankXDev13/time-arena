# Time Arena

Focus timer and time-tracking app. Start work/break sessions, organize them
by category, and track streaks, stats, and contribution history.

Turborepo monorepo (Bun workspaces): a Vite SPA talks to an Express API;
Drizzle schemas live in a shared package. The original Next.js app is frozen
under `apps/legacy` pending deletion.

## Units and ports

| Unit | Stack | Dev |
|------|-------|-----|
| `apps/web` | React 19 + Vite + React Router + TanStack Query + Tailwind 4 | `:5173` (proxies `/api` → `:3000`) |
| `apps/api` | Express + better-auth + Drizzle + pino | `:3000` |
| `packages/db` | Drizzle schemas + Neon client + migrations | — |
| `packages/types` | Shared contract types | — |
| `apps/legacy` | Frozen Next.js app (do not extend) | `:3001` |

## Setup

```bash
bun install
cp apps/api/.env.example apps/api/.env
```

Fill in `apps/api/.env`:

```bash
# openssl rand -base64 32
BETTER_AUTH_SECRET=
DATABASE_URL= # Neon pooled connection string (runtime)
API_URL=http://localhost:3000
LOG_LEVEL=info

# GitHub OAuth (Google keys stay empty until configured)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`apps/web` needs no `.env` for local dev: API calls are relative (`/api`
via the Vite proxy) and OAuth lands back via `VITE_WEB_URL` (defaults to
`http://localhost:5173`). Legacy keeps its own `apps/legacy/.env`.

## Commands (repo root)

```bash
bun run dev          # turbo dev: web + api together
bun run build        # turbo build (FULL TURBO on repeat runs)
bun run check-types  # turbo typecheck
bun run lint         # turbo lint
bun run test         # turbo test
bun run db:generate  # drizzle-kit generate from packages/db (offline, explicit, never cached)
bun run db:migrate   # apply migrations (touches the live DB — deliberate only)
```

Per package: `bun --filter @repo/api dev`, or work directly in the package
dir (`apps/api`, `apps/web`, `apps/legacy`, `packages/*`).

During development use `check-types` / `lint` / `test` for iteration; run a
full `build` only when a slice is complete.

## API layout (`apps/api`)

Thin layers, one direction only: `routes/` wires routers →
`controllers/` handle req/res + validation → `services/` hold business
logic and are the sole importer of `@repo/db` → `middleware/` owns auth,
validation, errors. `web` never imports `@repo/db`, only HTTP + `@repo/types`.

Auth runs behind an `AuthPort`; OAuth callback lands on `VITE_WEB_URL`
(relative `/` would strand users on the API origin).

## Testing

- API: HTTP boundary tests (supertest + vitest, colocated `*.test.ts`).
  Signup/signin, cursor pagination, stats fixtures, seed idempotency,
  owner-scoping (404s), 401s. Tests hit Neon, so they retry twice on
  connect flakes and mint unique users per run with cleanup.
- Web: jsdom component tests with mocked fetch/session (routing gates,
  optimistic rollback, debounced writes, disabled states).
- Legacy: original vitest suite, unchanged.

## Observability

- API: pino request logs (request ids, redacted auth/cookie headers,
  `LOG_LEVEL`), pretty in dev, JSON in production.
- Web dev: TanStack Devtools dock (Query + Time Arena panels), server event
  bus connected. Production builds strip devtools imports/JSX.

## Project layout

```
apps/web/src/{routes,components,hooks,stores,lib,devtools}  # SPA
apps/api/src/{routes,controllers,services,middleware}        # Express API
packages/db/src/{auth-schema,sessions,categories,users}.ts  # tables + client
packages/db/drizzle/                                        # baseline migration
packages/types/                                             # shared contracts
apps/legacy/                                                # frozen Next.js app
issues/                                                     # PRD + slice files
```

## Layer rules

1. `routes/` never touch the DB — only controllers.
2. `controllers/` never touch the DB — only services.
3. `services/` is the only place importing `@repo/db`.
4. Server state lives in TanStack Query, never in zustand (client UI state only).
5. Writes invalidate through domain key factories (`lib/query-keys.ts`),
   never magic strings.
