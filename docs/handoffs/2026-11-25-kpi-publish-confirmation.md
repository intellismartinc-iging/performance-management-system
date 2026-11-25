# Handoff: KPI templates, the publish confirmation (parity with behavioral)

2026-11-25 · The KPI template screens now ask before a publish, as the behavioral screens do. The user asked why only the behavioral screens had the dialog, and said to follow the PRD. Nothing is committed or pushed. Branch `feat/kpi-text-and-behavioral-templates` (PR #9, not merged). This file adds to `2026-11-25-behavioral-browser-pass-2.md`, which stays the start point for the browser checks, and edits no older handoff.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. What the PRD says

The PRD has the same row in section 4.11 (KPI Goal Templates, `docs/product-requirements-document.md` line 361) and in section 5.11 (Behavioral Assessment Templates, line 467): trigger "Save, submit, issue or launch", message type "Success / confirmation", required feedback "Name the record and resulting state; explain irreversible effects before confirm." The row is identical in both modules, so both need the same publish confirmation. The row is the same one that every other module uses, and it does not say whether the confirmation is a dialog; this change reads it as a dialog before the publish, because a publish freezes a version and cannot be undone. A product decision that the row means only a message after the save would change both modules together.

Cause of the gap: the behavioral status review (`2026-11-24-behavioral-module-status.md`) listed "publish is irreversible and has no confirmation" for behavioral only, and the KPI screens were not checked against the same row.

## 2. What changed

- The three KPI screens ask first: the create form (`goal-template-create-form.tsx`), the edit form of a draft (`goal-template-edit-form.tsx`, which already asked for Update Template), and the details view (`goal-template-details-view.tsx`). Save as Draft does not ask. The create form checks the template first, so a dialog never opens for a template the API would refuse.
- The words moved to one shared file, `web/src/features/review-templates/services/publish-confirmation.ts` (`PUBLISH_CONFIRMATION`), and the three behavioral components import it from there. Six components in two modules use it.
- Tests first: `web/tests/component/goal-template-publish-confirmation.test.tsx` (new, 6 tests) and two tests in `goal-template-create-form.test.tsx`. Five failed first, because no dialog existed. No test was weakened.
- Tests that passed at once, proven by mutation: "saves a draft without asking" failed when the edit form asked for every intent, and "still asks before Update Template" (no test covered `GoalTemplateEditForm` before) failed when the confirm step always sent `publish`. Both lines are restored. The test "opens no dialog for a template that the builder refuses" guards the builder's own validation, which runs before `onSave`: it does not prove that the create form checks the template before it asks, and that order stays untested.
- Correction to an older handoff: `2026-11-25-behavioral-rule-violations.md` section 2 says `PUBLISH_CONFIRMATION` lives in `behavioral-template-state.ts`. It moved to `services/publish-confirmation.ts`.
- `docs/system-architecture.md` lists the new service file and the two new test files of today (`goal-template-publish-confirmation.test.tsx` and `behavioral-template-editor-leave.test.tsx`).
- Ownership: the KPI web screens are changed here at the user's request. Whoever owns the KPI module reviews the three components in section 2.
- Verified on 2026-11-25 (commands run): web 33 files and 295 tests pass, `pnpm typecheck` and `pnpm lint` in `web` print nothing.
- Not verified: the KPI screens in a browser, and the dialog at phone width. `Update Template` on a published KPI template already asked before this change.

## 3. Open items

1. Browser check of the three KPI dialogs (create and publish a test KPI template, publish a draft from the details page). Publishing writes a real row, so ask the user first.
2. The browser checks of `2026-11-25-behavioral-browser-pass-2.md` section 3 still stand.

## 4. Constraints

- Do not push to `main`. Do not commit or push until the user says so. Never edit an old handoff. The user runs all SQL and logs in to the pane. Write the failing test first.
