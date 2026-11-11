-- Behavioral Assessment Templates
CREATE TABLE IF NOT EXISTS pms.behavioral_templates (
    template_id     uuid PRIMARY KEY,
    company_id      bigint NOT NULL REFERENCES pms.companies(company_id),
    status          text NOT NULL CHECK (status IN ('draft','published','archived')),
    current_version integer NOT NULL DEFAULT 0,
    published_by    uuid,
    published_at    timestamptz,
    archived_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Immutable, same split as KPI template versions.
CREATE TABLE IF NOT EXISTS pms.behavioral_template_versions (
    version_id  uuid PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES pms.behavioral_templates(template_id),
    version     integer NOT NULL,
    frozen_at   timestamptz,
    created_by  uuid,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (template_id, version)
);

CREATE TABLE IF NOT EXISTS pms.behavioral_sections (
    section_id  uuid PRIMARY KEY,
    version_id  uuid NOT NULL REFERENCES pms.behavioral_template_versions(version_id),
    title       text NOT NULL,
    sort_order  integer NOT NULL
);

CREATE TABLE IF NOT EXISTS pms.behavioral_questions (
    question_id         uuid PRIMARY KEY,
    section_id          uuid NOT NULL REFERENCES pms.behavioral_sections(section_id),
    prompt              text NOT NULL,
    question_type       text NOT NULL CHECK (question_type IN ('rating_scale','short_answer','paragraph','multiple_choice')),
    is_required         boolean NOT NULL DEFAULT true,
    allow_not_observed  boolean,
    sort_order          integer NOT NULL
);

CREATE TABLE IF NOT EXISTS pms.behavioral_choice_options (
    option_id   uuid PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES pms.behavioral_questions(question_id),
    label       text NOT NULL,
    UNIQUE (question_id, label)
);