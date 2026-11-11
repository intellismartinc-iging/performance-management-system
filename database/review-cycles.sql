-- Review Cycles
CREATE TABLE IF NOT EXISTS pms.cycles (
    cycle_id             uuid PRIMARY KEY,
    company_id           bigint NOT NULL REFERENCES pms.companies(company_id),
    name                 text NOT NULL,
    review_type          text NOT NULL CHECK (review_type IN ('standard','360','probationary','project_based')),
    state                text NOT NULL CHECK (state IN ('draft','scheduled','active','completed','cancelled')),
    evaluation_start     date NOT NULL,
    evaluation_end       date NOT NULL,
    assessment_start     timestamptz,
    verification_deadline timestamptz,
    activation_date      date,
    goals_weight         numeric(4,2) NOT NULL DEFAULT 0.50,
    behavioral_weight    numeric(4,2) NOT NULL DEFAULT 0.50,
    anonymity_threshold  integer CHECK (anonymity_threshold BETWEEN 2 AND 10),
    cancelled_reason     text,
    finalized_at         timestamptz,
    released_at          timestamptz,
    idempotency_key      text,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CHECK (evaluation_end >= evaluation_start)
);

CREATE TABLE IF NOT EXISTS pms.cycle_participants (
    participant_id        uuid PRIMARY KEY,
    cycle_id              uuid NOT NULL REFERENCES pms.cycles(cycle_id),
    employee_id           uuid NOT NULL REFERENCES pms.employees(guid),
    frozen_position_id    bigint REFERENCES pms.positions(position_id),
    kpi_version_id        uuid REFERENCES pms.kpi_template_versions(version_id),
    behavioral_version_id uuid REFERENCES pms.behavioral_template_versions(version_id),
    created_at            timestamptz NOT NULL DEFAULT now(),
    UNIQUE (cycle_id, employee_id)
);

CREATE TABLE IF NOT EXISTS pms.cycle_stages (
    stage_id       uuid PRIMARY KEY,
    cycle_id       uuid NOT NULL REFERENCES pms.cycles(cycle_id),
    perspective    text NOT NULL CHECK (perspective IN ('self','manager','hr','peer','upward')),
    evaluator_role text,
    sort_order     integer NOT NULL,
    deadline       timestamptz
);