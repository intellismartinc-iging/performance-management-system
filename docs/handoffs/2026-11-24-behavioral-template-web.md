# Handoff: Behavioral Assessment templates in the web, and the template details

2026-11-24 · The backend of Behavioral Assessment templates now follows the KPI logic, and the web can create a template. This session also added four columns to `pms.behavioral_templates` (name, description, category, review type) so that the builder matches the legacy form. Read it after `2026-11-24-kpi-text-and-pms-only.md`, which holds the rest of the day.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Integrate the Behavioral Assessment templates into `web`, with a builder like the legacy form (`pms-be/frontend/legacy/reviews.js`) and the KPI page chrome (back link, header, pinned actions), so that an HR admin can create, save as draft, and publish a template. Template details, edit draft, and publish a draft from the list are the next slice.

## 2. Current state

- Branch `main` equals `origin/main` at `fbaa8a6`. Everything below is uncommitted. No branch exists. The user wants no branch, commit, or push until the module is finished.
- Backend (`backend/src/modules/behavioral-assessment`), follows `kpi-goals`: `@UseGuards(JwtAuthGuard, AdminRoleGuard)` on the class (every route is admin only), the company and the actor (`created_by`, `published_by`) come from the account through `CompanyResolver` (exported by `KpiGoalsModule`), the controller reads `req.user.userId`. The entity maps `company`, `name`, `description`, `category`, `review_type` (all text, the last four nullable). The create DTO takes name (required, 120), description (2000), category, reviewType, and sections. The update DTO takes the same details as optional fields.
- Database (`packages/database`): `behavioral_templates` has the four columns with CHECK lists. New expand migration `migrations/2026-11-24-behavioral-template-details.sql`. The seed fills them. Shared enums `BEHAVIORAL_TEMPLATE_CATEGORIES` (general performance, self-assessment, manager evaluation, peer feedback, 360 feedback, probationary evaluation, others) and `BEHAVIORAL_REVIEW_TYPES` (self, manager, peer, upward, others). "Others" is a label only: it has no text input.
- Shared types: `saveBehavioralTemplateRequestSchema` sends the exact body of the backend DTO (`name`, `description`, `category`, `reviewType`, sections with `allowNotObserved` and `choiceOptions: [{ label }]`). The old schema sent `canMarkNotObserved` and `choices`, which the backend rejects. New response schemas `behavioralTemplateListResponseSchema` and `behavioralTemplateTreeResponseSchema`.
- Web: the list page (`behavioral-assessment-template/page.tsx`) shows name, version, category, review type, status, and update date. The builder (`new/page.tsx` and `behavioral-template-editor.tsx`) has the legacy layout: Template information (name, description, category, review type), a section header with up and down buttons, question cards (move, duplicate, delete, title, type, Required, Allow Not Observed, a 1 to 5 scale strip, choice options), dashed "Add question to section" and "Add Section", and Preview, Save as Draft, Publish Template in the pinned bar. The server action `createBehavioralTemplate` creates the draft, then publishes it for the publish intent, and redirects to the list with `?saved=`.
- Verified on 2026-11-24 (commands run): backend 16 files and 169 tests pass, `tsc` and lint print nothing. Web 26 files and 235 tests pass, typecheck and eslint print nothing. `@pms/shared-types` 89 tests pass. `@pms/database` 13 tests pass. Root `pnpm lint` and `pnpm typecheck` print no error. The Section 3 trees of `docs/system-architecture.md` match the working tree (507 of 507 files).
- Not verified: the migrations on the user's database (`2026-11-24-kpi-company-position-text.sql` ran, and `2026-11-24-behavioral-template-details.sql` did not run yet), a real create in the browser as admin001 (the built-in browser pane was not logged in: the user logs in, then the builder can be filled), the row in `pms.behavioral_templates` (company from the account, `created_by` GUID), a 403 for the `user` and `manager` logins, `next build`, and a viewport and theme pass.

## 3. Key decisions and rationale

- The four template details are stored, not faked: the user asked for the legacy form, and a field that is never saved misleads. hersvin agreed that we add the columns, and this handoff is the note for him (section 7).
- Category and review type each end with an "Others" option, with no extra input, as the user asked.
- The company and the actor come from the account, never from the client: `docs/coding-standards.md` and the PRD (COM-006) say so, and it matches KPI.
- Every behavioral route is admin only, including the two GETs, like KPI ("same logic").
- A draft needs the same content as a publish (name, at least one section, at least one question each): the API stores a draft as a template and validates it the same way.
- Question description (the "Optional Description" under a question in the legacy form) is NOT built: the questions table has no column for it.
- From now on a handoff is a new dated file and old handoffs are never edited (`AGENTS.md`, `CLAUDE.md`, and `docs/handoffs/README.md` say so). This file does not edit `2026-11-24-kpi-text-and-pms-only.md`: where that file differs from this one, this one wins.

## 4. Dead ends (do not retry)

- A schema that sends `canMarkNotObserved` or `choices`: the backend DTO has `allowNotObserved` and `choiceOptions`, and the pipe forbids unknown keys.
- Editing a shell script with a single-quoted `node -e` that holds SQL: the single quotes of the SQL end the shell string and vanish. Write the file with the Write tool.
- `next build` while the web dev server runs: both use `.next`.
- Showing name and description in the builder without a column: the values were thrown away.

## 5. Files and changes (all uncommitted on `main`)

| File                                                                                                                                                                                                                                                                                                                                                                                                              | Status                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `packages/database/schema/behavioral-assessments.sql`, `seeds/behavioral-assessments.sql`, `migrations/2026-11-24-behavioral-template-details.sql`, `schema.test.mjs`                                                                                                                                                                                                                                             | four columns with CHECK lists, seed values, new expand migration (not run), tests        |
| `packages/shared-types/src/domain/behavioral-template-category.enum.ts`, `behavioral-review-type.enum.ts`, `index.ts`, `scripts/generate-rows.mjs`, `src/rows/behavioral-templates.row.ts` (generated), `src/dtos/behavioral-template.schema.ts`, `test/behavioral-template.test.mjs`, `test/db-enums.test.mjs`                                                                                                   | enums, generator mapping, request and response schemas, tests                            |
| `backend/src/modules/behavioral-assessment/` (`controllers`, `services`, `dtos`, `entities`, `behavioral-assessment.module.ts`) and `kpi-goals/kpi-goals.module.ts`                                                                                                                                                                                                                                               | guards, company and actor from the account, the four columns, `CompanyResolver` exported |
| `backend/src/modules/behavioral-assessment/dtos/behavioral-template-contract.spec.ts`, `controllers/behavioral-assessment.controller.spec.ts`, `services/behavioral-assessment.service.spec.ts`                                                                                                                                                                                                                   | new and updated specs                                                                    |
| `web/src/features/review-templates/` (`api/behavioral-template-requests.ts`, `services/behavioral-template-reader.ts`, `save-behavioral-template.ts`, `behavioral-template-state.ts`, `template-requests.ts`, `components/behavioral-template-*.tsx`, `goal-template-notice.tsx`), `web/src/constants/behavioral-template-path.ts`, `domain-labels.ts`, and the two pages under `behavioral-assessment-template/` | the web integration                                                                      |
| `web/tests/` (7 new or updated behavioral tests)                                                                                                                                                                                                                                                                                                                                                                  | tests                                                                                    |
| `AGENTS.md`, `CLAUDE.md`, `docs/handoffs/README.md`                                                                                                                                                                                                                                                                                                                                                               | the handoff rule: a new file each time, no edits to old handoffs                         |
| `docs/system-architecture.md`, `docs/behavioral-assessment-web-integration.md`, `docs/database-schema.md`                                                                                                                                                                                                                                                                                                         | trees and notes                                                                          |

## 6. Constraints and corrections

- Do not push to `main`. Do not create a branch, commit, or push until the user says so. Read `AGENTS.md`, `CLAUDE.md`, `backend/AGENTS.md`, and `web/AGENTS.md` first.
- The user runs all SQL: write the script, never connect to the database. pgAdmin keeps an aborted transaction open after a script stops: run `ROLLBACK;` or open a new Query Tool tab.
- Do not edit `packages/shared-types/src/rows/`: run `pnpm --filter @pms/shared-types generate`, then `pnpm build:packages`.
- Write the failing test first. Call the advisor before the approach and before you say the work is done. Replies in Taglish and Caveman ultra, following `.claude/skills/writing-rules/SKILL.md`. No em dashes.
- The legacy form (`C:\Users\mdasalla\Documents\GitHub\pms-be\frontend\legacy\reviews.js`, lines 95 to 125) is the reference for the user flow: list with search, Create, builder, Preview, Save as Draft, Publish, details with Edit, Duplicate, Archive. The backend has no archive, duplicate, or new-version route for behavioral templates.

## 7. Open items and next steps

1. The user runs `packages/database/migrations/2026-11-24-behavioral-template-details.sql`, restarts the backend, logs in as admin001 in the built-in browser pane, and creates a template. Then check the row: `SELECT template_id, company, name, category, review_type, status, created_at FROM pms.behavioral_templates ORDER BY created_at DESC;`. Also try a `user` login: it must get a 403.
2. Slice c: the details page (`[templateId]`), edit of a draft (`postUpdateBehavioralTemplate` exists in the api layer and is unused), and publish of a draft. A published template cannot be edited: the backend answers 409. A new version of a published template, archive, and duplicate need backend routes.
3. Tell hersvin (his module): the four new columns on `behavioral_templates`, the guard on every route, the company and actor from the account, the `userId` fix, and that the question description of the legacy form has no column.
4. Gaps that stay: the list returns every company's templates (CWE-639, same as KPI), the contract of `behavioral_questions` has no description, and the edit of a draft does not check that the template belongs to the caller's company.
5. Still open from the KPI handoff: the contract step (drop the old `company_id` and `position_id` columns and `pms.companies`, `pms.positions`, `pms.departments`), and a browser check of the KPI flows.

## 8. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-24-behavioral-template-web.md, and docs/handoffs/2026-11-24-kpi-text-and-pms-only.md first. We are on branch main in C:\Users\mdasalla\Documents\GitHub\performance-management-system with uncommitted changes. Do not create a branch, commit, or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: ask me whether I ran migrations/2026-11-24-behavioral-template-details.sql and created a template in the browser, then build slice c (details page, edit draft, publish draft) from section 7 of the handoff.
```
