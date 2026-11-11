-- Employees
CREATE TABLE IF NOT EXISTS pms.employees (
    guid            uuid PRIMARY KEY,
    id              bigint,
    code            text NOT NULL,
    email           text NOT NULL,
    first_name      text NOT NULL,
    last_name       text NOT NULL,
    hrdotnet_id     bigint,
    company_id      bigint NOT NULL REFERENCES pms.companies(company_id),
    position_id     bigint REFERENCES pms.positions(position_id),
    department_id   bigint NOT NULL REFERENCES pms.departments(department_id),
    status          text NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    UNIQUE (company_id, employee_code)
);