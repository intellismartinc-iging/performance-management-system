-- Notifications
CREATE TABLE IF NOT EXISTS pms.notifications (
    notification_id uuid PRIMARY KEY,
    recipient_id    uuid NOT NULL REFERENCES pms.employees(guid),
    source_type     text NOT NULL CHECK (source_type IN ('assignment','nte','pip')),
    source_id       uuid NOT NULL,
    message         text NOT NULL,
    read_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pms.notification_preferences (
    employee_id                  uuid PRIMARY KEY REFERENCES pms.employees(guid),
    review_notifications_enabled boolean NOT NULL DEFAULT true
);