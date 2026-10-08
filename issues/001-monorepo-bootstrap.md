## Parent PRD

`issues/prd.md`

## What to build

Bootstrap the monorepo so old and new coexist. Add Bun workspaces, Turbo pipeline with all day-one tasks and strict env tracking, skeleton applications and shared packages, root plus per-package dev commands, and Vite proxy to Express. Demoable as `turbo build check-types` caching and `turbo dev` starting both apps.

## Acceptance criteria

- [ ] Root dev starts web and API together; per-package dev works alone
- [ ] Build ordering respects API depending on DB package
- [ ] Repeat build/typecheck hits cache
- [ ] No change to legacy Next.js app behavior

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 2
- User story 3
- User story 4
