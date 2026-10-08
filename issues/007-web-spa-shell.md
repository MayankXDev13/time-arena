## Parent PRD

`issues/prd.md`

## What to build

Vite SPA shell with client routing, query client, theme, and ported domain UI. Protected routes redirect when unauthenticated, timer/focus flows work against Express via typed client, verified with network-edge mocks.

## Acceptance criteria

- [ ] Protected routes gate correctly; signin/signup navigate
- [ ] Timer, history, stats, categories screens read/write via new API
- [ ] Stores survive reload where currently expected
- [ ] No import from database package in web bundle

## Blocked by

- Blocked by `issues/003-session-history-crud.md`
- Blocked by `issues/004-stats-contributions.md`
- Blocked by `issues/005-categories-seed.md`
- Blocked by `issues/006-settings-profile.md`

## User stories addressed

- User story 18
- User story 19
- User story 20
- User story 21
