# packages

Internal workspace packages. They are private and are never published to npm. An app uses a package through `workspace:*`.

| Package                                | Name                | Contents                                                                 |
| -------------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| [shared-types](shared-types/README.md) | `@pms/shared-types` | Zod enums, one generated row schema per table, request and response DTOs |
| [database](database/README.md)         | `@pms/database`     | PostgreSQL `schema.sql`, `seed.sql`, and the `init-db.mjs` script        |

## Rules

- `shared-types` depends on `zod` only. It imports no other workspace package. Lint enforces this.
- `database` depends on `pg` only.
- `web` imports `@pms/shared-types` and no other workspace. `backend` imports `@pms/shared-types` and never `@pms/web`.
- Import a package by its name, from its root: `@pms/shared-types`. Do not import `@pms/shared-types/dist/...` and do not use a relative path into `packages/`.
- `packages/database/schema.sql` is the source of truth for tables and columns. `shared-types` generates its row schemas from it.

## Commands

Run from the repository root.

```bash
pnpm build:packages                          # build packages/*, which web and backend read from dist/
pnpm --filter @pms/shared-types generate     # rewrite shared-types/src/rows from schema.sql
pnpm --filter @pms/shared-types test         # generate:check, then enum, row, and auth schema tests
pnpm --filter @pms/database db:init          # create the database, apply schema.sql and seed.sql
```

`pnpm install` also builds the packages through the root `postinstall` script.

## Test status

The `shared-types` tests pass. The `database` test (`pnpm --filter @pms/database test`) fails: it looks for `CREATE TABLE employees`, and the schema writes `CREATE TABLE IF NOT EXISTS pms.employees`.
