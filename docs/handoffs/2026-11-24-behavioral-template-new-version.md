# Handoff: Behavioral Assessment templates, the next version of a published template

2026-11-24 · A published behavioral template can now be edited: the edit publishes its next version and keeps the old one, as the KPI templates do. This file also records two fixes that came after `2026-11-24-behavioral-template-details-and-edit.md`, and corrects that file.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Make the behavioral assessment templates follow the same flow as the KPI templates, as the PRD says for both: a draft is edited in place and published, and a published template is edited by publishing its next version (PRD lines 268 and 388: "create next version or archive"). Archive and duplicate are still open.

## 2. Current state

- Branch `main` equals `origin/main` at `fbaa8a6`. Everything is uncommitted. No branch exists. The user wants no branch, commit, or push until the module is finished.
- Backend: `POST behavioral-assessment/:id/versions` (admin only, like the other routes). It validates the body before any write (at least one section, and a question in every section: a frozen version needs content), then runs in one transaction: it locks the template row (`pessimistic_write`), answers 404 for a missing template and 409 unless the template is `published`, applies the details only when the request gives them, increases `currentVersion`, sets `publishedBy` (the employee GUID of the account) and `publishedAt`, inserts the new version row frozen at once, and saves the sections, questions, and options with **new ids** (the ids of a request are ignored, because the rows of version 1 still exist). It deletes nothing: version 1 stays as it was. `saveSections` and `saveQuestions` take the repositories as a parameter, so `create` and `update` did not change.
- Web: the details page of a published template has **Edit Template**. The edit page opens a published template (only an archived one redirects to the details). The builder of a published template has Preview and **Update Template**, with no Save as Draft. Update Template asks first: "This publishes version N+1. Cycles that already use version N keep it." The server action `saveBehavioralTemplateEdits` takes the intent `update`, posts to `versions`, and redirects to the list with `?saved=updated`. The note "A published template cannot be edited yet" is gone.
- Verified on 2026-11-24 (commands run): backend 16 files and 184 tests pass, `tsc` and lint print nothing. Web 31 files and 274 tests pass, typecheck and eslint print nothing. `@pms/shared-types` 90 tests, `@pms/database` 13 tests. Root `pnpm lint` and `pnpm typecheck` print no error.
- Not verified: an update of a published template in the browser, and that the database then holds both versions (version 2 in the list, and the rows of version 1 still in `pms.behavioral_template_versions`, `pms.behavioral_sections`, and so on); the 403 for the `user` and `manager` logins; `next build`; a viewport and theme pass. The assistant never clicked in a browser: the built-in pane was not logged in.

## 3. Corrections to the earlier handoffs (read these first)

- `2026-11-24-behavioral-template-details-and-edit.md` says the backend has no new-version route for behavioral templates and that a published template "cannot be edited yet". Now it has the route and the edit exists. Its open item 2 (new version) is done. Archive and duplicate stay open.
- The KPI template position had a broken rule: `@Matches(/S/, ...)` instead of `/\S/` in `backend/.../create-kpi-goal-template.dto.ts`. The backslash was lost when the file was written through the shell. The API accepted a position only when it had a capital S, so the edit and the publish of a KPI template answered "The request contains invalid fields." for "Analyst" or "Engineering Manager". Fixed, with a contract test for four positions without a capital S. Cause of the miss: the first test used "Software Engineer".
- The web showed only the general message of an API error. A new helper `apiErrorText` (`web/src/features/review-templates/services/api-error-text.ts`) adds up to three field messages, and the four template actions use it (create and edit of KPI and behavioral).
- `2026-11-24-behavioral-template-web.md` and `...-details-and-edit.md` list the review types and the options box as they were when they were written. Now: the review types are self, manager, peer, upward, hr, others, and each answer option is its own input with an × (see the details-and-edit file, section 3).

## 4. Key decisions and rationale

- Copy on write, like KPI, because the PRD gives both templates the same lifecycle and a published version must not change under a cycle that uses it.
- A new transaction only for the new route. `create`, `update`, and `publish` of the behavioral service still save the template, the version, and the content in separate steps without a transaction (hersvin's code, which AGENTS.md asks to change inside one). Not changed here, to keep the diff to what was asked.
- `publish` of a draft has no content check (a draft with no section can be published). The new route has one. Not changed here.
- The new route does not check that the template belongs to the caller's company (CWE-639), the same as the KPI route. The user asked for the same logic.

## 5. Dead ends (do not retry)

- Writing a file that holds a regex or `\n` through `node -e` in double quotes: the shell removes the backslash (the `/S/` bug). Write a script file with the Write tool, run it, then grep the result.
- Reusing the section and question ids of a request in a new version: the primary keys of version 1 still exist.

## 6. Files and changes (all uncommitted on `main`)

| File                                                                                                                                                                                                                 | Status                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `backend/src/modules/behavioral-assessment/services/behavioral-assessment.service.ts` and its spec                                                                                                                   | `createVersion`, `assertPublishable`, the repositories as a parameter, 11 new tests |
| `backend/src/modules/behavioral-assessment/controllers/behavioral-assessment.controller.ts` and its spec                                                                                                             | `POST :id/versions`                                                                 |
| `backend/src/modules/kpi-goals/dtos/create-kpi-goal-template.dto.ts` and `kpi-goal-template-contract.spec.ts`                                                                                                        | the `/\S/` fix and its tests                                                        |
| `web/src/features/review-templates/api/behavioral-template-requests.ts`, `services/manage-behavioral-template.ts`, `services/api-error-text.ts`                                                                      | the version request, the `update` intent, the error text helper                     |
| `web/src/features/review-templates/components/behavioral-template-editor.tsx`, `behavioral-template-edit-form.tsx`, `behavioral-template-details-view.tsx`, `behavioral-template-create-form.tsx`, and the edit page | published status, the confirmation, Edit Template                                   |
| `web/tests/`                                                                                                                                                                                                         | updated and new tests for the above                                                 |
| `docs/system-architecture.md`, `docs/behavioral-assessment-web-integration.md`                                                                                                                                       | route and status                                                                    |

## 7. Constraints and corrections

- Do not push to `main`. Do not create a branch, commit, or push until the user says so. Read `AGENTS.md`, `CLAUDE.md`, `backend/AGENTS.md`, and `web/AGENTS.md` first.
- Never edit an old handoff: write a new dated file. The user runs all SQL: write the script, never connect to the database.
- Write the failing test first. Call the advisor before the approach and before you say the work is done. Replies in Taglish and Caveman ultra, following `.claude/skills/writing-rules/SKILL.md`. No em dashes.

## 8. Open items and next steps

1. Browser pass in the user's own Chrome as admin001: publish the draft, open the details, **Edit Template**, change the name, **Update Template**, confirm. The list must show the template as Published at Version 2. Then ask the user to run the check below, which must show both versions:

```sql
SELECT v.version, v.frozen_at, v.created_by, count(s.section_id) AS sections
FROM pms.behavioral_template_versions v
LEFT JOIN pms.behavioral_sections s ON s.version_id = v.version_id
WHERE v.template_id = (SELECT template_id FROM pms.behavioral_templates ORDER BY created_at DESC LIMIT 1)
GROUP BY v.version, v.frozen_at, v.created_by ORDER BY v.version;
```

2. Also try the 403 notice with a `user` or `manager` login, and the KPI edit and publish that the `/S/` fix repaired.
3. Archive and duplicate need backend routes. Ask hersvin.
4. Tell hersvin (his module): the `versions` route, the content check, and that `create`, `update`, and `publish` still run without a transaction.
5. Gaps that stay: the list and the details return every company's templates (CWE-639), the options have no sort column, the question description of the legacy form has no column, and the contract step of the KPI text change (drop the old `company_id` and `position_id` columns and the old tables) is still open.

## 9. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-24-behavioral-template-new-version.md, and the two handoffs before it (details-and-edit, and web) first. We are on branch main in C:\Users\mdasalla\Documents\GitHub\performance-management-system with uncommitted changes. Do not create a branch, commit, or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done. Write any file that holds a regex or a backslash with the Write tool, and grep it after.

First task: ask me what I saw in the browser pass (section 8, items 1 and 2), then fix what I report.
```
