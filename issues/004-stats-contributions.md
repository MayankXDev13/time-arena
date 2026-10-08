## Parent PRD

`issues/prd.md`

## What to build

Deepen stats aggregation behind a narrow service interface. Daily/weekly totals, streaks, category breakdowns, and yearly contributions verified by boundary values only, allowing future move from in-memory to SQL without caller or test changes.

## Acceptance criteria

- [ ] Stats totals match seeded work/break fixtures
- [ ] Contribution year returns full day series
- [ ] Streak logic has single source in contract package
- [ ] No test asserts internal SQL or loop structure

## Blocked by

- Blocked by `issues/003-session-history-crud.md`

## User stories addressed

- User story 12
- User story 13
