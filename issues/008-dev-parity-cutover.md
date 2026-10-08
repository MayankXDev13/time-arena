## Parent PRD

`issues/prd.md`

## What to build

Harden dev/prod parity and pipeline. Dev proxy, env example plus strict cache tracking, non-cached database tasks, upload stub preservation, and legacy Next.js removal decision after parity demo.

## Acceptance criteria

- [ ] Dev proxy forwards API calls without CORS drift
- [ ] Missing required env fails fast with clear message
- [ ] Generate/migrate run explicitly and never from cache
- [ ] Parity checklist signed off before legacy deletion

## Blocked by

- Blocked by `issues/007-web-spa-shell.md`

## User stories addressed

- User story 1
- User story 4
- User story 22
