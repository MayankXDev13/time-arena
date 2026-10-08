## Parent PRD

`issues/prd.md`

## What to build

Port authentication behind a session port. Express login/signup/social flows plus protected-middleware 401/200 behavior end-to-end, verified over HTTP with isolated test database. SPA keeps using the existing auth client against the new API origin.

## Acceptance criteria

- [ ] Email/password signup and signin work via API
- [ ] Unauthenticated protected route returns 401, authenticated returns 200
- [ ] Web signin/signup screens authenticate against Express API
- [ ] No Next.js auth adapter remains in new path

## Blocked by

- Blocked by `issues/001-monorepo-bootstrap.md`

## User stories addressed

- User story 5
- User story 6
- User story 7
