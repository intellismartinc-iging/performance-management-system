-- Development fixtures only. Stores employee journal entries, notices to explain, and read receipts.

-- ---------------------------------------------------------------------------
-- 9. 202 Files
-- ---------------------------------------------------------------------------

INSERT INTO pms.journal_entries (
    entry_id, employee_id, author_id, company, entry_date, entry_type,
    title, description, cycle_id, created_at
)
VALUES
  ('00000000-0000-0000-0000-000000000221',
   '284ddc9e-ebe4-468d-945f-fb18af72e622',
   '284ddc9e-ebe4-468d-945f-fb18af72e622',
   'Mayon Consolidated Inc.',
   '2026-11-04', 'progress',
   'Feature release', 'Shipped the performance dashboard to production.',
   '00000000-0000-0000-0000-000000000141', now())
ON CONFLICT (entry_id) DO NOTHING;

INSERT INTO pms.nte_notices (
    notice_id, employee_id, company, category, subject, body,
    explanation_deadline, incident_date, incident_reference, status,
    explanation_text, explanation_submitted_at, early_close_reason, cancel_reason,
    issued_by, issued_at, closed_by, closed_at,
    created_at, updated_at
)
VALUES
  ('00000000-0000-0000-0000-000000000231',
   '284ddc9e-ebe4-468d-945f-fb18af72e622',
   'Mayon Consolidated Inc.',
   'conduct',
   'Unapproved overtime',
   'You logged two days of overtime without prior approval.',
   '2026-11-20', '2026-11-01', 'INC-2026-0141', 'issued',
   NULL, NULL, NULL, NULL,
   '00000000-0000-0000-0000-000000000023', now(), NULL, NULL, now(), now())
ON CONFLICT (notice_id) DO NOTHING;

INSERT INTO pms.nte_read_receipts (receipt_id, notice_id, employee_id, opened_at)
VALUES
  ('00000000-0000-0000-0000-000000000241',
   '00000000-0000-0000-0000-000000000231',
   '284ddc9e-ebe4-468d-945f-fb18af72e622', now())
ON CONFLICT (receipt_id) DO NOTHING;
