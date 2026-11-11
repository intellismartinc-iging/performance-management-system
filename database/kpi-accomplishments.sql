-- KPI Accomplishments
CREATE TABLE IF NOT EXISTS pms.accomplishments (
    accomplishment_id  uuid PRIMARY KEY,
    participant_id     uuid NOT NULL REFERENCES pms.cycle_participants(participant_id),
    cycle_id           uuid NOT NULL REFERENCES pms.cycles(cycle_id),
    employee_id        uuid NOT NULL REFERENCES pms.employees(guid),
    status             text NOT NULL CHECK (status IN ('draft','submitted','returned','verified')),
    remarks            text,
    submitted_by       uuid,
    submitted_at       timestamptz,
    verified_by        uuid,
    verified_at        timestamptz,
    return_reason      text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (participant_id)
);

CREATE TABLE IF NOT EXISTS pms.accomplishment_actuals (
    actual_id          uuid PRIMARY KEY,
    accomplishment_id  uuid NOT NULL REFERENCES pms.accomplishments(accomplishment_id),
    indicator_id       uuid NOT NULL REFERENCES pms.kpi_indicators(indicator_id),
    actual_value       numeric CHECK (actual_value >= 0),
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Correction history. Each resubmission after return creates a new row.
CREATE TABLE IF NOT EXISTS pms.accomplishment_versions (
    version_id         uuid PRIMARY KEY,
    accomplishment_id  uuid NOT NULL REFERENCES pms.accomplishments(accomplishment_id),
    version            integer NOT NULL,
    actuals_json       jsonb NOT NULL,
    remarks            text,
    actor_id           uuid,
    acted_at           timestamptz,
    correction_reason  text,
    UNIQUE (accomplishment_id, version)
);