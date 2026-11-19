-- ============================================================================
-- 4. KPI Goal Templates
-- ============================================================================
-- Defines versioned KPI templates, indicators, scoring ranges, and matrix axes.

-- Stores the current KPI template state for a company and position.
CREATE TABLE IF NOT EXISTS pms.kpi_goal_templates (
    template_id     uuid PRIMARY KEY,
    position_id     bigint REFERENCES pms.positions(position_id),
    company_id      bigint NOT NULL REFERENCES pms.companies(company_id),
    -- name: required for a new template, in the API. NULL for rows made before the column existed.
    name            text,
    description     text,
    status          text NOT NULL CHECK (status IN ('draft','published','archived')),
    current_version integer NOT NULL DEFAULT 0,
    published_by    uuid,
    published_at    timestamptz,
    archived_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Immutable: one row per published/draft version.
-- Keeps each numbered version of a KPI template.
CREATE TABLE IF NOT EXISTS pms.kpi_template_versions (
    version_id  uuid PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES pms.kpi_goal_templates(template_id),
    version     integer NOT NULL,
    frozen_at   timestamptz,                       -- NULL until published
    created_by  uuid,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (template_id, version)
);

-- Belong to a template version. Stable identity per indicator row.
-- Defines the measures and scoring direction in a template version.
-- An indicator has no matrix, a custom reference table, or a numeric threshold scale (Tpl-G-004).
CREATE TABLE IF NOT EXISTS pms.kpi_indicators (
    indicator_id        uuid PRIMARY KEY,
    version_id          uuid NOT NULL REFERENCES pms.kpi_template_versions(version_id),
    name                text NOT NULL,
    description         text,
    unit                text,
    target              numeric CHECK (target >= 0),
    direction           text NOT NULL CHECK (direction IN ('higher_is_better','lower_is_better')),
    weight              numeric(5,2) NOT NULL CHECK (weight > 0),
    score_target_met    numeric(3,2) NOT NULL CHECK (score_target_met BETWEEN 1 AND 5),
    score_below_target  numeric(3,2) NOT NULL CHECK (score_below_target BETWEEN 1 AND 5),
    matrix_kind         text NOT NULL DEFAULT 'none' CHECK (matrix_kind IN ('none','table','scale')),
    matrix_title        text,                      -- required in the API when matrix_kind is not 'none'
    scale_bound         text CHECK (scale_bound IN ('minimum','maximum')),  -- required in the API for a scale
    -- true: the scale sets the score instead of the target-met and below-target scores.
    -- Allowed only when matrix_kind is 'scale'. false: the matrix is for reference only.
    use_for_scoring     boolean NOT NULL DEFAULT false  -- Tpl-G-004 toggle
);

-- One threshold per row of a numeric threshold scale. Rows are ordered by threshold.
-- scale_bound 'minimum': lower_bound is the minimum actual (inclusive); upper_bound is NULL. The first row is 0.
-- scale_bound 'maximum': upper_bound is the maximum actual (inclusive); lower_bound is NULL.
--   The final row has no upper limit: upper_bound is NULL too.
CREATE TABLE IF NOT EXISTS pms.kpi_indicator_scales (
    scale_id     uuid PRIMARY KEY,
    indicator_id uuid NOT NULL REFERENCES pms.kpi_indicators(indicator_id),
    lower_bound  numeric,
    upper_bound  numeric,
    label        text,                             -- rating label, required in the API
    score        numeric(3,2) NOT NULL CHECK (score BETWEEN 1 AND 5),
    CHECK (lower_bound IS NULL OR upper_bound IS NULL)
);

-- Rows of a custom reference table. A row has one cell per column, in kpi_indicator_matrix_cells.
-- The table never changes scoring.
CREATE TABLE IF NOT EXISTS pms.kpi_indicator_matrix_rows (
    row_id       uuid PRIMARY KEY,
    indicator_id uuid NOT NULL REFERENCES pms.kpi_indicators(indicator_id),
    row_label    text,                             -- legacy rows have no label
    position     integer NOT NULL DEFAULT 0        -- order within the indicator
);

-- Columns of a custom reference table.
CREATE TABLE IF NOT EXISTS pms.kpi_indicator_matrix_columns (
    col_id       uuid PRIMARY KEY,
    indicator_id uuid NOT NULL REFERENCES pms.kpi_indicators(indicator_id),
    col_label    text NOT NULL,
    position     integer NOT NULL DEFAULT 0        -- order within the indicator
);

-- The text in one cell of a custom reference table.
CREATE TABLE IF NOT EXISTS pms.kpi_indicator_matrix_cells (
    row_id       uuid NOT NULL REFERENCES pms.kpi_indicator_matrix_rows(row_id),
    col_id       uuid NOT NULL REFERENCES pms.kpi_indicator_matrix_columns(col_id),
    value        text NOT NULL,
    PRIMARY KEY (row_id, col_id)
);

CREATE INDEX IF NOT EXISTS kpi_indicator_matrix_cells_col_idx ON pms.kpi_indicator_matrix_cells (col_id);
