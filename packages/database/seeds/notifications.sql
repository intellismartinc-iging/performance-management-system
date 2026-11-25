-- Development fixtures only. Stores employee notifications and review-notification preferences.

-- ---------------------------------------------------------------------------
-- 12. Notifications
-- ---------------------------------------------------------------------------

INSERT INTO pms.notifications (
    notification_id, recipient_id, source_type, source_id, message,
    read_at, created_at
)
VALUES
  ('00000000-0000-0000-0000-000000000331',
   '284ddc9e-ebe4-468d-945f-fb18af72e622',
   'nte',
   '00000000-0000-0000-0000-000000000231',
   'You have a new Notice of Explanation: Unapproved overtime.',
   NULL, now()),
  ('00000000-0000-0000-0000-000000000332',
   '00000000-0000-0000-0000-000000000022',
   'assignment',
   '00000000-0000-0000-0000-000000000201',
   'You have a new evaluation to complete: CY2026-Q4 self-assessment.',
   now(), now())
ON CONFLICT (notification_id) DO NOTHING;

INSERT INTO pms.notification_preferences (employee_id, review_notifications_enabled)
VALUES
  ('284ddc9e-ebe4-468d-945f-fb18af72e622', true),
  ('00000000-0000-0000-0000-000000000022', true),
  ('00000000-0000-0000-0000-000000000023', true)
ON CONFLICT (employee_id) DO NOTHING;
