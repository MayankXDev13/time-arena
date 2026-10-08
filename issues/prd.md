## Problem Statement

As the owner of time-arena, a single-package Next.js time-tracking app, I want to split into a Turborepo monorepo with a React+Vite SPA and an Express API plus a separate Drizzle package, so that frontend and backend can evolve independently, tasks are cached/orchestrated, and auth/data logic is no longer coupled to Next.js.

## Solution

Incrementally adopt Turborepo with Bun workspaces, keeping the existing Next.js app working until parity. Introduce four deployable/testable units: a Vite SPA using React Router and TanStack Query, an Express API organized as routes/controllers/services/middleware, a shared Drizzle database package, and a shared contract/types package. Wire all long-lived tasks through a single pipeline with strict env tracking and parallel-run migration.

## User Stories

1. As a developer, I want a single root dev command that starts web and API together, so that I don't run terminals manually.
2. As a developer, I want per-package dev commands to still work standalone, so that I can focus on one app.
3. As a developer, I want workspace dependencies between API and DB packages, so that build order is automatic.
4. As a developer, I want cached builds and typechecks, so that repeat runs take milliseconds.
5. As a user, I want to sign up/sign in with email/password, so that my data is private.
6. As a user, I want to sign in with Google/GitHub, so that onboarding is fast.
7. As a user, I want protected API routes to reject unauthenticated calls, so that my data is safe.
8. As a user, I want to create a focus session, so that my work is tracked.
9. As a user, I want to paginate session history with filters, so that I can review past work.
10. As a user, I want to see recent sessions, so that I can resume quickly.
11. As a user, I want to update/end/delete a session, so that mistakes are fixable.
12. As a user, I want daily/weekly stats, streaks, and category breakdowns, so that I see progress.
13. As a user, I want a yearly contribution graph, so that consistency is visible.
14. As a user, I want to create/rename/recolor/delete categories, so that work is organized.
15. As a user, I want seeded default categories, so that first run is useful.
16. As a user, I want to read/update timer settings and theme, so that the app fits my workflow.
17. As a user, I want to read/update my profile bio, so that my account feels personal.
18. As a user, I want the SPA to handle routing client-side with protected routes, so that navigation is instant.
19. As a user, I want timer state to survive reloads via shared stores, so that focus isn't lost.
20. As a developer, I want a single shared contract for sessions/categories/settings, so that frontend and backend never drift.
21. As a developer, I want drizzle schema/client isolated in one package, so that only the API touches the DB.
22. As a developer, I want DB generate/migrate as explicit non-cached tasks, so that schema changes are deliberate.

## Implementation Decisions

- Package manager stays Bun with workspace globs for applications and shared packages; local Turbo binary takes precedence over global.
- Four units: Vite SPA on default Vite port, Express API on port 3000, database package owning schema plus migrations plus client, contract package owning validation schemas and inferred types plus gamification constants.
- API layering rule: routes only wire routers, controllers only handle request/response plus validation plus session extraction, services only contain business logic and are the sole importer of the database package, middleware owns auth and validation and errors.
- Auth is behind a session port interface; the Express adapter implements it and controllers depend on the port, never on the auth library directly. Social plus email/password behavior is preserved from the current app, Next.js cookies adapter is removed.
- Session history keeps cursor pagination semantics from the current implementation; stats and contributions are deepened behind a narrow service interface to hide whether aggregation happens in SQL or in code.
- Web data access goes through a typed HTTP client plus query keys; the SPA never imports the database package, only the shared contract and HTTP.
- Pipeline tasks from day one: build with upstream dependency ordering and dist outputs, typecheck with upstream ordering, lint, test, persistent dev with no cache, and explicit non-cached database tasks.
- Environment isolation: public Vite-prefixed variables for web only, database and secret variables for API/database only, example env committed while real envs stay ignored, cache invalidates on relevant env changes.
- Local dev proxy: SPA development server forwards API calls to the Express port to avoid CORS drift; production uses explicit API base URL.
- Migration is parallel-run: new units are scaffolded alongside the untouched Next.js app, existing domain folders are moved by concept rather than rewritten, old app is deleted only after parity.

## Testing Decisions

- Good tests verify behavior through public interfaces (HTTP for API, router plus query client for web), not internals; a passing behavior must survive refactors and renames.
- Vertical tracer slices: one failing boundary test then minimal implementation, never bulk test-first across layers.
- Modules under boundary test: session history/CRUD, stats/contributions, categories including seed, settings/profile, auth protected-path 401/200, SPA protected routing with mocked server.
- Prior art: existing vitest suites for session/category/auth queries and API client become the seed for service and controller boundary tests; direct DB-shape assertions are removed in favor of HTTP assertions using an isolated test database.
- No mocked services inside API tests; web tests mock only at the network edge.

## Out of Scope

- Deleting the legacy Next.js app (after parity, separate slice).
- Remote caching in CI and production deployment topology.
- File upload behavior beyond preserving the current stub route.
- New gamification rules beyond porting current badges/levels.
- Design system overhaul beyond porting current Tailwind components.

## Further Notes

- Current duplication to resolve: session/category TypeScript types exist in three places and streak logic exists in two places; contract package is the single source after migration.
- Riskiest deepen: stats aggregation currently loads all rows in memory; service interface must allow moving to SQL without changing callers or tests.
