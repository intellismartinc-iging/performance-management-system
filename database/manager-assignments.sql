-- Manager Assignments
CREATE TABLE IF NOT EXISTS pms.manager_assignments (
    assignment_id        uuid PRIMARY KEY,
    employee_id          uuid NOT NULL REFERENCES pms.employees(guid),
    manager_id           uuid NOT NULL REFERENCES pms.employees(guid),
    company_id           bigint NOT NULL REFERENCES pms.companies(company_id),
    effective_date       date NOT NULL,
    status               text NOT NULL CHECK (status IN ('pending','applied','blocked','cancelled')),
    previous_manager_id  uuid REFERENCES pms.employees(guid),
    apply_reason         text,
    cancel_reason        text,
    blocked_reason       text,
    applied_at           timestamptz,
    cancelled_at         timestamptz,
    blocked_at           timestamptz,
    idempotency_key      text,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now()
);