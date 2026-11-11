-- Identity and Directory
CREATE TABLE IF NOT EXISTS pms.companies (
    company_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL,
    demo_mode   boolean NOT NULL DEFAULT false,
    demo_date   date,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pms.departments (
    department_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id    bigint NOT NULL REFERENCES pms.companies(company_id),
    name          text NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pms.positions (
    position_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id  bigint NOT NULL REFERENCES pms.companies(company_id),
    title       text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);