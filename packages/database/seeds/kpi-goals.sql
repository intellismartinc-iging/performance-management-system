-- Development fixtures only. Defines versioned KPI templates, indicators, scoring ranges, and matrix axes.

-- ---------------------------------------------------------------------------
-- 4. KPI Goal Templates
-- ---------------------------------------------------------------------------

INSERT INTO pms.kpi_goal_templates (
    template_id, position, company, name, description, status, current_version, published_by, published_at, created_at, updated_at
)
VALUES
  ('00000000-0000-0000-0000-000000000041',
   'Software Engineer',
   'Mayon Consolidated Inc.',
   'Software Engineer Performance Goals',
   'Position-specific targets, weighted by indicator.',
   'published', 1,
   '00000000-0000-0000-0000-000000000022', now(), now(), now())
ON CONFLICT (template_id) DO NOTHING;

INSERT INTO pms.kpi_template_versions (version_id, template_id, version, frozen_at, created_by, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000051',
   '00000000-0000-0000-0000-000000000041', 1, now(),
   '00000000-0000-0000-0000-000000000022', now())
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO pms.kpi_indicators (
    indicator_id, version_id, name, description, unit, target, direction, weight,
    score_target_met, score_below_target, matrix_kind, matrix_title, scale_bound, use_for_scoring
)
VALUES
  ('00000000-0000-0000-0000-000000000061',
   '00000000-0000-0000-0000-000000000051',
   'Completed milestones', 'Milestones finished within the cycle', 'Count', 4, 'higher_is_better', 60.00,
   4, 2, 'scale', 'Milestone thresholds', 'minimum', true),
  ('00000000-0000-0000-0000-000000000062',
   '00000000-0000-0000-0000-000000000051',
   'Production defects', 'Defects found in released builds', 'Count', 2, 'lower_is_better', 40.00,
   4, 2, 'scale', 'Defect thresholds', 'maximum', true)
ON CONFLICT (indicator_id) DO NOTHING;

-- Indicator 61 is a minimum scale: each row applies from its minimum to the next. Indicator 62 is a
-- maximum scale: each row applies up to its maximum, and the final row has no upper limit.
INSERT INTO pms.kpi_indicator_scales (scale_id, indicator_id, lower_bound, upper_bound, label, score)
VALUES
  ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000061', 0, NULL, 'Below target', 1),
  ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000061', 2, NULL, 'Near target', 3),
  ('00000000-0000-0000-0000-000000000073', '00000000-0000-0000-0000-000000000061', 4, NULL, 'Target met', 5),
  ('00000000-0000-0000-0000-000000000074', '00000000-0000-0000-0000-000000000062', NULL, 1, 'Target met', 5),
  ('00000000-0000-0000-0000-000000000075', '00000000-0000-0000-0000-000000000062', NULL, NULL, 'Above target', 2)
ON CONFLICT (scale_id) DO NOTHING;
