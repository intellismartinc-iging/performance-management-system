-- Performance Improvement Plan
CREATE TABLE IF NOT EXISTS pms.pip_plans (
    plan_id                       uuid PRIMARY KEY,
    employee_id                 uuid NOT NULL REFERENCES pms.employees(guid),
    company_id                  bigint NOT NULL REFERENCES pms.companies(company_id),
    origin                      text NOT NULL CHECK (origin IN ('automatic','manual')),
    state                       text NOT NULL CHECK (state IN ('awaiting_planning','draft','active','completed','not_met','cancelled')),
    referral_review_required    boolean,
    completion_note             text,
    cancel_reason               text,
    linked_evaluation_snapshot_id uuid REFERENCES pms.evaluation_snapshots(snapshot_id),
    created_by                  uuid,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    closed_at                   timestamptz
);

-- One row per (cycle_id + indicator_id) that triggered the plan.
CREATE TABLE IF NOT EXISTS pms.pip_sources (
    source_id           uuid PRIMARY KEY,
    plan_id             uuid NOT NULL REFERENCES pms.pip_plans(plan_id),
    cycle_id            uuid NOT NULL REFERENCES pms.cycles(cycle_id),
    indicator_id        uuid NOT NULL REFERENCES pms.kpi_indicators(indicator_id),
    frozen_actual       numeric,
    frozen_target       numeric,
    direction           text,
    unit                text,
    score               numeric,
    matrix_criteria_json jsonb,
    covered_by_week_id  uuid,
    exclusion_reason    text,
    referral_reviewed   boolean NOT NULL DEFAULT false,
    UNIQUE (plan_id, cycle_id, indicator_id)
);

CREATE TABLE IF NOT EXISTS pms.pip_weeks (
    week_id            uuid PRIMARY KEY,
    plan_id            uuid NOT NULL REFERENCES pms.pip_plans(plan_id),
    source_id          uuid REFERENCES pms.pip_sources(source_id),
    focus              text,
    goal_description   text,
    target_value       numeric,
    unit               text,
    direction          text,
    start_date         date NOT NULL,
    end_date           date NOT NULL,
    status             text NOT NULL CHECK (status IN ('pending','active','completed','not_met')),
    follow_up_of_week_id uuid REFERENCES pms.pip_weeks(week_id),
    follow_up_reason   text,
    assessment_reason_missed text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS pms.pip_week_updates (
    update_id       uuid PRIMARY KEY,
    week_id         uuid NOT NULL REFERENCES pms.pip_weeks(week_id),
    employee_id     uuid NOT NULL REFERENCES pms.employees(guid),
    status          text NOT NULL CHECK (status IN ('draft','submitted','returned')),
    progress_actual numeric,
    remarks         text,
    returned_reason text,
    submitted_at    timestamptz,
    updated_at      timestamptz
);

CREATE TABLE IF NOT EXISTS pms.pip_week_assessments (
    assessment_id  uuid PRIMARY KEY,
    week_id        uuid NOT NULL REFERENCES pms.pip_weeks(week_id),
    update_id      uuid REFERENCES pms.pip_week_updates(update_id),
    assessor_id    uuid NOT NULL,
    outcome        text NOT NULL CHECK (outcome IN ('met','not_met','missed')),
    verified_actual numeric,
    remarks        text,
    missed_reason  text,
    assessed_at    timestamptz NOT NULL
);

ALTER TABLE pms.pip_sources
    ADD CONSTRAINT IF NOT EXISTS fk_pip_sources_covered_by_week_id
    FOREIGN KEY (covered_by_week_id) REFERENCES pms.pip_weeks(week_id);