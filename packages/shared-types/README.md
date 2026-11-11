# @pms/shared-types

Zod schemas and types shared by `web` and `backend`.

```
src/
  common.ts     Building blocks: idSchema, bigintIdSchema, decimalSchema, and so forth
  domain/       One file per enum. Values are the database CHECK codes.
  rows/         One row schema per table. GENERATED from packages/database/schema.sql.
  dtos/         Response DTOs built from the rows, and request schemas.
```

## Rules

- **Wire format is camelCase.** The database is snake_case. A field is the camelCase of its
  column, with no renames. One exception: a boolean column that has no verb gets `is`
  (`demo_mode` becomes `isDemoMode`).
- **Enum values are the database codes** (`in_progress`, not "In Progress"). The words shown to a
  user live in `web/src/constants/domain-labels.ts`.
- **Response schemas describe shape only.** Business rules live on request schemas.
- `bigint` ids are numbers (`bigintIdSchema`). `uuid` ids are strings (`idSchema`).

## Commands

```bash
pnpm --filter @pms/shared-types generate        # rewrite src/rows from schema.sql
pnpm --filter @pms/shared-types generate:check  # fail when src/rows is out of date
pnpm --filter @pms/shared-types test            # generate:check, then enum and row tests
pnpm build:packages                             # build dist, which web and backend read
```

After you change `schema.sql`: run `generate`, then `pnpm build:packages`. If a column has a
`CHECK ... IN (...)` list, add the enum under `src/domain/` and map it in `ENUM_COLUMNS` in
`scripts/generate-rows.mjs`. The generator fails when a CHECK column has no mapping.
