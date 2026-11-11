# PostgreSQL schema and seed

## Layout

- `database/schema.sql` - DDL. Creates schema `pms` and all tables. Idempotent (`IF NOT EXISTS` style).
- `database/seed.sql` - Sample data. Idempotent (`ON CONFLICT DO NOTHING`).
- `database/init-db.mjs` - Standalone script. Creates the database if it does not exist, then applies schema + seed.

## Automatic schema evolution

`schema.sql` is safe to re-run against an existing database. Every `CREATE TABLE`
uses `IF NOT EXISTS`, followed by a block of `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
and `ADD CONSTRAINT IF NOT EXISTS` statements. Re-running the file automatically:

- adds new columns and constraints defined in the file
- leaves already-present columns untouched (no-op)
- does not drop columns automatically

To propagate a **removed** column, add a matching line to the evolution block
at the bottom of `schema.sql`:

```sql
ALTER TABLE pms.<table> DROP COLUMN IF EXISTS <column>;
```

New NOT NULL columns with no DEFAULT require a one-time backfill before
re-running so existing rows are not left with a NULL violation:

```sql
UPDATE pms.<table> SET <column> = '<value>' WHERE <column> IS NULL;
```

## Auto-bootstrap on app start

`src/database/database-bootstrap.module.ts` is imported by `AppModule`.
On every `nest start` it:

1. Connects to PostgreSQL using `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` env vars (defaults: `localhost:5433/postgres`).
2. Creates the target database (`POSTGRES_DB`, default `postgres`) if it does not exist.
3. Runs `database/schema.sql` against that database.
4. Runs `database/seed.sql` against that database.

The bootstrap logs progress and continues to `app.listen` after seeding.

## Manual application

```bash
# Create database + apply schema + seed
node database/init-db.mjs

# Or with psql
psql -h localhost -p 5433 -U postgres -d postgres \
  -c 'CREATE DATABASE pms;'
psql -h localhost -p 5433 -U postgres -d pms \
  -v ON_ERROR_STOP=1 -f database/schema.sql
psql -h localhost -p 5433 -U postgres -d pms \
  -v ON_ERROR_STOP=1 -f database/seed.sql
```

## Notes

- `seed.sql` is sample data only. Do not use in production.
- `schema.sql` is a preliminary domain model, not a production migration.
- The NestJS backend is configured for PostgreSQL via TypeORM in `app.module.ts`.
