-- Evaluator Assignments and Assessments
CREATE TABLE IF NOT EXISTS pms.assignments (
    assignment_id  uuid PRIMARY KEY,
    cycle_id       uuid NOT NULL REFERENCES pms.cycles(cycle_id),
    participant_id uuid NOT NULL REFERENCES pms.cycle_participants(participant_id),
    evaluator_id   uuid NOT NULL REFERENCES pms.employees(guid),
    stage_id       uuid NOT NULL REFERENCES pms.cycle_stages(stage_id),
    state          text NOT NULL CHECK (state IN ('locked','not_started','in_progress','submitted','completed')),
    deadline       timestamptz,
    submitted_by   uuid,
    submitted_at   timestamptz,
    completed_at   timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (participant_id, evaluator_id, stage_id)
);

CREATE TABLE IF NOT EXISTS pms.assignment_responses (
    response_id     uuid PRIMARY KEY,
    assignment_id   uuid NOT NULL REFERENCES pms.assignments(assignment_id),
    answers_json    jsonb NOT NULL,
    version         integer NOT NULL,
    status          text NOT NULL CHECK (status IN ('draft','submitted')),
    submitted_by    uuid,
    submitted_at    timestamptz,
    reopen_reason   text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (assignment_id, version)
);

CREATE TABLE IF NOT EXISTS pms.evaluation_snapshots (
    snapshot_id                 uuid PRIMARY KEY,
    cycle_id                    uuid NOT NULL REFERENCES pms.cycles(cycle_id),
    participant_id              uuid NOT NULL REFERENCES pms.cycle_participants(participant_id),
    goals_component_score       numeric,
    behavioral_component_score  numeric,
    overall_score               numeric,
    evidence_json               jsonb NOT NULL,
    finalized_by                uuid,
    finalized_at                timestamptz,
    released_at                 timestamptz,
    UNIQUE (cycle_id, participant_id)
);