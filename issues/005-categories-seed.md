## Parent PRD

`issues/prd.md`

## What to build

Category CRUD plus seed slice end-to-end. List/create/update/delete scoped by owner and idempotent seed for first run, verified over HTTP and visible in SPA dropdown.

## Acceptance criteria

- [ ] Category CRUD round-trips with owner scoping
- [ ] Seed is idempotent and provides defaults on fresh DB
- [ ] SPA can list and select categories against new API

## Blocked by

- Blocked by `issues/002-auth-port.md`

## User stories addressed

- User story 14
- User story 15
