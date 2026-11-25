-- Expand step: a behavioral template gets a name, a description, a category, and a review type.
-- schema/behavioral-assessments.sql defines them as nullable columns: the API requires the name,
-- the category, and the review type for a new template, and a row made before this change has none.
--
-- It only adds. It drops nothing, and it reads no other schema.
-- A table that does not exist is skipped. Running it again changes nothing more.
-- Run it before the new backend starts: the new entity maps these columns.
--
--   psql "<your connection>" -v ON_ERROR_STOP=1 -f packages/database/migrations/2026-11-24-behavioral-template-details.sql

BEGIN;

DO $$
BEGIN
    IF to_regclass('pms.behavioral_templates') IS NULL THEN
        RAISE NOTICE 'pms.behavioral_templates does not exist: nothing to change';
        RETURN;
    END IF;

    ALTER TABLE pms.behavioral_templates
        ADD COLUMN IF NOT EXISTS name text,
        ADD COLUMN IF NOT EXISTS description text,
        ADD COLUMN IF NOT EXISTS category text,
        ADD COLUMN IF NOT EXISTS review_type text;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid = 'pms.behavioral_templates'::regclass
                      AND conname = 'behavioral_templates_category_check') THEN
        ALTER TABLE pms.behavioral_templates ADD CONSTRAINT behavioral_templates_category_check
            CHECK (category IN ('general_performance','self_assessment','manager_evaluation','peer_feedback','feedback_360','probationary_evaluation','others'));
    END IF;

    -- The review type list gained 'hr' after the first version of this script: replace the check,
    -- so a database that already ran the first version accepts it too.
    ALTER TABLE pms.behavioral_templates DROP CONSTRAINT IF EXISTS behavioral_templates_review_type_check;
    ALTER TABLE pms.behavioral_templates ADD CONSTRAINT behavioral_templates_review_type_check
        CHECK (review_type IN ('self','manager','peer','upward','hr','others'));
END $$;

COMMIT;

-- Check after the commit: the four new columns, all nullable.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'pms' AND table_name = 'behavioral_templates'
  AND column_name IN ('name', 'description', 'category', 'review_type')
ORDER BY column_name;
