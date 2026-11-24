-- Expand step: company and position become text columns, for a database made before this change.
-- schema.sql now defines company text, position text, and frozen_position text instead of the
-- company_id, position_id, and frozen_position_id foreign keys to pms.companies and pms.positions.
--
-- What it does, all inside schema pms (it reads no other schema):
--   1. Adds `company text` to every module table that had company_id, and fills it from
--      pms.companies.name through the old id.
--   2. Adds `position text` to kpi_goal_templates (from pms.positions.title) and
--      `frozen_position text` to cycle_participants (from pms.positions.title).
--   3. Stops when a row has no company, then sets company NOT NULL.
--   4. Drops NOT NULL on the old company_id, so an insert from the new code succeeds.
-- It drops no column and no table. The old id columns, pms.companies, and pms.positions stay until a
-- later contract step, which needs its own decision.
--
-- The ids are compared as text, because company_id is a uuid in a table that the old TypeORM
-- synchronize created (behavioral_templates) and a bigint elsewhere. A uuid never matches a bigint,
-- so such a row has no company after the backfill and the script stops with its table name.
--
-- A table that does not exist is skipped. Running it again changes nothing more.
-- Run it before the new backend starts: the new entities map the new columns.
--
--   psql "<your connection>" -v ON_ERROR_STOP=1 -f packages/database/migrations/2026-11-24-kpi-company-position-text.sql

BEGIN;

DO $$
DECLARE
    tbl text;
    missing bigint;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'kpi_goal_templates', 'behavioral_templates', 'cycles', 'manager_assignments',
        'journal_entries', 'nte_notices', 'pip_plans', 'operational_goals'
    ] LOOP
        CONTINUE WHEN to_regclass('pms.' || tbl) IS NULL;

        EXECUTE format('ALTER TABLE pms.%I ADD COLUMN IF NOT EXISTS company text', tbl);

        IF EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'pms' AND table_name = tbl AND column_name = 'company_id') THEN
            IF to_regclass('pms.companies') IS NOT NULL THEN
                EXECUTE format(
                    'UPDATE pms.%I x SET company = c.name FROM pms.companies c WHERE x.company IS NULL AND c.company_id::text = x.company_id::text',
                    tbl);
            END IF;
            EXECUTE format('ALTER TABLE pms.%I ALTER COLUMN company_id DROP NOT NULL', tbl);
        END IF;

        EXECUTE format('SELECT count(*) FROM pms.%I WHERE company IS NULL', tbl) INTO missing;
        IF missing > 0 THEN
            RAISE EXCEPTION 'pms.% has % rows with no company: stop, nothing is changed', tbl, missing;
        END IF;
        EXECUTE format('ALTER TABLE pms.%I ALTER COLUMN company SET NOT NULL', tbl);
    END LOOP;

    -- Positions: the template position, and the position that a cycle freezes for a participant.
    IF to_regclass('pms.kpi_goal_templates') IS NOT NULL THEN
        ALTER TABLE pms.kpi_goal_templates ADD COLUMN IF NOT EXISTS position text;
        IF to_regclass('pms.positions') IS NOT NULL AND EXISTS (
            SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'pms' AND table_name = 'kpi_goal_templates' AND column_name = 'position_id') THEN
            UPDATE pms.kpi_goal_templates t SET position = p.title
              FROM pms.positions p WHERE t.position IS NULL AND p.position_id = t.position_id;
        END IF;
    END IF;

    IF to_regclass('pms.cycle_participants') IS NOT NULL THEN
        ALTER TABLE pms.cycle_participants ADD COLUMN IF NOT EXISTS frozen_position text;
        IF to_regclass('pms.positions') IS NOT NULL AND EXISTS (
            SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'pms' AND table_name = 'cycle_participants' AND column_name = 'frozen_position_id') THEN
            UPDATE pms.cycle_participants c SET frozen_position = p.title
              FROM pms.positions p WHERE c.frozen_position IS NULL AND p.position_id = c.frozen_position_id;
        END IF;
    END IF;
END $$;

COMMIT;

-- Check after the commit: which tables now carry the text columns, and how many rows have a company.
SELECT table_name, column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'pms' AND column_name IN ('company', 'position', 'frozen_position', 'company_id')
ORDER BY 1, 2;
