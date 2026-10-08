## Parent PRD

`issues/prd.md`

## What to build

Full session history plus CRUD slice through routes/controllers/services. Cursor pagination with category/mode/date filters, create/update/end/delete, recent list, all verified at HTTP boundary including auth scoping.

## Acceptance criteria

- [ ] Create then paginate history with cursor and filters
- [ ] Update/end/delete round-trip correctly and scope by owner
- [ ] Recent endpoint returns limit-scoped rows
- [ ] Tracer test written first, implementation minimal to pass

## Blocked by

- Blocked by `issues/002-auth-port.md`

## User stories addressed

- User story 8
- User story 9
- User story 10
- User story 11
