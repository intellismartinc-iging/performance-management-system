-- Audit Events
CREATE TABLE IF NOT EXISTS pms.audit_events (
    event_id        uuid PRIMARY KEY,
    entity_type     text NOT NULL,
    entity_id       uuid NOT NULL,
    action          text NOT NULL,
    actor_id        uuid,
    reason          text,
    before_json     jsonb,
    after_json      jsonb,
    idempotency_key text,
    occurred_at     timestamptz NOT NULL DEFAULT now()
);