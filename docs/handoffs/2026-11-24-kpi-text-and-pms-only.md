# Handoff: KPI Goal Templates after PR #8, pms only, and the text company and position

2026-11-24 · Our side (KPI Goal Templates, web, docs) after hersvin's PR #8 (`fbaa8a6`, "read auth and employees from the pms schema"). This session reviewed the PR, repaired the local database, removed the dead sign-up flows, dropped the old `public` tables, and started the change that turns the KPI `company_id` and `position_id` into text. hersvin's own handoff is `2026-11-24-auth-pms-schema.md`: read it for the backend side, and do not edit it.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Make the KPI Goal Templates module work on a database that has only schema `pms` and no `pms.companies` or `pms.positions`: `company` and `position` become text, in line with `pms.employees`. hersvin agreed to this on 2026-11-24.

## 2. Current state

- Branch `main` equals `origin/main` at `fbaa8a6`. All work below is uncommitted. No branch exists. The user wants no branch, commit, or push until the module is finished. `package.json` and `pnpm-lock.yaml` show a pnpm 12.23.0 change that is not ours: leave it alone.
- Review of PR #8 from our side: `docs/reviews/2026-11-24-auth-pms-schema-review.md` (findings A to I, file and line, what is good, the KPI text plan, the stale docs).
- Local database (the user's, not hersvin's), brought to the new shape with local scripts in `.codex/scripts` (gitignored, run by the user): `pms-auth-tables.sql` (new `pms.employees` columns, roles 1 to 3 as ADMIN, MANAGER, USER, `pms.users`, logins copied from `public.users`), `pms-behavioral-questions.sql` (`pms.behavioral_questions`, 0 rows), `pms-move-remaining-logins.sql` (admin, manager, user), and `pms-drop-public.sql` (drops the four old `public` tables). Reported by the user: all ran, and the check query after the drop returned no table in `public`. `pms.users` holds five logins (admin 1, admin001 4, manager 8, user 9, lebronjames023 10) with employees 25, 21, 26, 27, 24 and roles ADMIN, ADMIN, MANAGER, USER, ADMIN. A backup of the old tables is at `C:\Users\Admin\Documents\public-schema-backup-2026-11-24.sql` (outside the repo).
- `pms.companies`, `pms.positions`, and `pms.departments` still exist on the local database (the KPI module reads the first two today). `schema.sql` no longer creates them.
- Verified on 2026-11-24 before the KPI text change started: backend `pnpm test` 14 files and 158 tests pass (hersvin's handoff says 13 files and 160: the difference is not investigated), backend `tsc --noEmit` and lint print nothing, web `vitest run` 19 files and 188 tests pass, web `pnpm typecheck` and `eslint src tests` print nothing, `@pms/shared-types` 80 tests pass, `@pms/database` 10 tests pass, root `pnpm lint` and `pnpm typecheck` exit 0.
- Checked in the built-in browser on 2026-11-24 (web dev server on port 3000): `/login` has no "Set up your account" section and no links, an empty submit shows "Enter your email or username." and "Enter your password." on the two inputs, and a logged-out visit to `/register` or `/sign-up` ends on `/login` (the route gate redirects it: not a 404 page). Not checked: what a logged-in visitor sees on those paths (a 404 is expected), and a viewport or theme pass.
- Not verified: a login of each account in the browser after the drop, the KPI list and create flows on the local database, `next build`, and whether `pms.behavioral_choice_options` has a foreign key to the questions table.

## 3. Key decisions and rationale

- Everything lives in schema `pms`. Nothing reads or writes `public`, except the one-time copy of the old logins that the user approved.
- KPI text change: `company` and `position` replace `company_id` and `position_id`. The user asked for it, and hersvin agreed on 2026-11-24. It follows `pms.employees`, where both are text.
- Web sign-up and register are removed, because the backend routes are gone. This assumes hersvin does not bring `AccountRegistrationService.signUp()` back as a route (his open item 6). Git history restores the pages if he does.
- The Behavioral Assessment web integration is paused until the fixes are done. Scope note: `docs/behavioral-assessment-web-integration.md`.
- No branch, commit, or push until the module is finished. Read `AGENTS.md` and `CLAUDE.md` first.
- Old handoffs are not edited (the user's rule on 2026-11-24): new state goes into this file.
- The backend belongs to its owner: change only what the task names. The entity fix of `BehavioralQuestion` and the KPI text change were approved by the user.
- The user runs all SQL. Write the script, never connect to the database.

## 4. Dead ends (do not retry)

- Do not run `packages/database/migrations/2026-11-24-auth-tables-to-pms.sql` on this database: it read `public` (now dropped), it expects an empty `pms`, and `CREATE TABLE IF NOT EXISTS` skips the old-shape `pms.employees`, so its `INSERT` fails.
- A test that "schema.sql creates every table the entities map to" would not have caught the `pms.users` error: the error came from the database state. The red tests are the entity-schema test and the dangling-`REFERENCES` check.
- "All entities map to `pms`" was wrong until `BehavioralQuestion` got `schema: "pms"`: check with `backend/src/entity-schema.spec.ts`, not by reading a grep list.
- pgAdmin keeps an aborted transaction open after a script stops: run `ROLLBACK;` or open a new Query Tool tab before the next query.

## 5. Files and changes (all uncommitted on `main`)

| File                                                                                                                                                                                                                                                                              | Status                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `backend/src/modules/behavioral-assessment/entities/behavioral-question.entity.ts`                                                                                                                                                                                                | `schema: "pms"`                                                |
| `backend/src/entity-schema.spec.ts`                                                                                                                                                                                                                                               | new: every entity maps to `pms`                                |
| `web/src/app/(auth)/register/page.tsx`, `(auth)/sign-up/page.tsx`, `web/src/features/auth/components/auth-option-link.tsx`                                                                                                                                                        | deleted                                                        |
| `web/src/app/(auth)/login/page.tsx`, `features/auth/components/credentials-form.tsx`, `hooks/use-credentials-form.ts`, `services/auth-credentials.ts`, `services/submit-credentials.ts`, `services/session-guard.ts`, `api/auth-requests.ts`, `constants/workspace-navigation.ts` | login only, no sign-up or register mode                        |
| `web/tests/component/credentials-form.test.tsx`, `tests/integration/submit-credentials.test.ts`, `tests/unit/session-guard.test.ts`                                                                                                                                               | updated: the removed modes are refused                         |
| `packages/shared-types/src/dtos/auth.schema.ts`, `test/auth.test.mjs`                                                                                                                                                                                                             | sign-up, register, and account-created schemas removed         |
| `AGENTS.md`, `README.md`, `docs/README.md`, `docs/system-architecture.md`, `docs/project-structure.md`, `docs/workspace-blueprint.md`, `docs/database-schema.md`, `docs/database-design.md`, `packages/database/README.md`                                                        | stale statements corrected                                     |
| `docs/reviews/2026-11-24-auth-pms-schema-review.md`, `docs/behavioral-assessment-web-integration.md`                                                                                                                                                                              | new                                                            |
| `docs/handoffs/2026-11-24-kpi-text-and-pms-only.md` (this file) and its row in `docs/handoffs/README.md`                                                                                                                                                                          | new                                                            |
| `.codex/scripts/pms-auth-tables.sql`, `pms-behavioral-questions.sql`, `pms-move-remaining-logins.sql`, `pms-drop-public.sql`                                                                                                                                                      | local, gitignored, run                                         |
| `packages/database/schema/*.sql` (7 files), `seeds/*.sql` (7 files), `schema.test.mjs`, `migrations/2026-11-24-kpi-company-position-text.sql`                                                                                                                                     | company and position as text. The migration is new and not run |
| `packages/shared-types/src/rows/*` (generated), `src/dtos/goal-template.schema.ts`, `evidence-file.schema.ts`, and 7 tests                                                                                                                                                        | position and company as text                                   |
| `backend/src/modules/kpi-goals/` (`company-resolver.service.ts`, `kpi-goals.service.ts`, `create-kpi-goal-template.dto.ts`, `kpi-goal-template.entity.ts`) and 3 specs                                                                                                            | company and position as text                                   |
| `web/src/features/review-templates/` (`goal-template-format.ts`, `template-requests.ts`, `goal-template-editor-state.ts`, `goal-template-selection.ts`, `goal-template-list.tsx`), the 3 template pages, and 8 tests                                                              | position as text, `toPositionOptions`                          |

The KPI text change adds more rows to this table as it goes (see section 8).

## 6. Constraints and corrections

- Do not push to `main`. Do not create a branch or commit until the user says so.
- `backend/` belongs to the backend developer: change only what the task names. Read `backend/AGENTS.md` and `web/AGENTS.md` before you touch those folders.
- Do not edit `packages/shared-types/src/rows/`: run `pnpm --filter @pms/shared-types generate`, then `pnpm build:packages`.
- Write the failing test first. Call the advisor before the approach and before you say the work is done.
- Replies in Taglish and Caveman ultra, following `.claude/skills/writing-rules/SKILL.md`. No em dashes.
- Do not edit the old handoffs (`2026-11-19-kpi-goal-templates.md`, `2026-11-24-auth-pms-schema.md`).
- Accounts: admin001 (user 4, employee 21), lebronjames023 (user 10, employee 24), manager (8), user (9), admin (1). The dev password hash of the seeds belongs to the seeded logins only.

## 7. Open items and next steps

1. KPI text change: code done, see section 8. The user runs the migration and checks it in the browser.
2. Tell hersvin (we do not edit his files): `AdminRoleGuard` compares the role id `"1"` while `/auth/me` compares the code, the migration copies `HR_ADMIN` and reads `public`, `AccountRegistrationService.signUp()` has no caller, and `BehavioralQuestion` needed a schema.
3. Verify in a browser: `/login`, the removed pages, a login of each account, the KPI list.
4. Then the Behavioral Assessment web integration, from its scope note. Its `companyId` is a uuid in the DTO while the company is now text: settle that with the KPI change.

## 8. KPI text change: plan and progress

Plan (sizes from a search on 2026-11-24): `packages/database/schema` 7 files (`company_id` becomes `company text NOT NULL`, `position_id` becomes `position text`, `frozen_position_id` becomes `frozen_position text`), seeds 7 files, `packages/shared-types` 11 files, `backend` 11 files, `web` 8 source files and 6 test files. Order: failing test for dangling `REFERENCES`, schema and a migration for existing databases, seeds, `generate` and `build:packages`, backend (tests first), web, docs, this handoff.

Decisions: columns `company text NOT NULL`, `position text`, `frozen_position text`. API fields are `company` and `position` (the camelCase of the column). The company comes from the account `pms.employees.company`, never from the client, with exact equality. `GET /kpi-goals/positions` returns the distinct non-null `pms.employees.position` of that company as a list of strings. An update accepts the template's unchanged position even when no employee holds it. The migration goes to `packages/database/migrations/2026-11-24-kpi-company-position-text.sql`, expand only: it adds the text columns, backfills from `pms.companies.name` and `pms.positions.title`, and drops NOT NULL on the old id columns. Dropping the old columns and tables is a later step that needs the user's yes. The CWE-639 company filter stays open.

Done (verified 2026-11-24, all uncommitted):

- Red then green: `packages/database/schema.test.mjs` checks that every `REFERENCES pms.X` target is created by `schema.sql`, and that the migration only expands (no `DROP`, no `public.`). 12 tests pass.
- Schema: the 7 schema files and the 7 seed files use `company`, `position`, and `frozen_position` as text (seed values match `seeds/employees.sql`).
- Migration (written, NOT run): `packages/database/migrations/2026-11-24-kpi-company-position-text.sql`. It adds the text columns to the 8 module tables and to `cycle_participants`, backfills from `pms.companies.name` and `pms.positions.title`, stops when a row has no company, sets `company` NOT NULL, and drops NOT NULL on the old `company_id`. It drops nothing. The user must run it before the new backend starts.
- `@pms/shared-types`: rows regenerated. `goal-template.schema.ts` has `position` (text, 1 to 120 characters, nullable), a positions list of strings, and no `positionTitle`. `evidence-file.schema.ts` has `company`. 80 tests pass.
- Backend: `CompanyResolver` returns the company text (no `pms.companies` query, no `DataSource`). `KpiGoalsService` reads `pms.employees` for the position list and the position check, and has no join to `pms.positions`. An unchanged position stays valid on update (tested). The entity and the create DTO use `company` and `position`. 14 files and 157 tests pass, `tsc` and lint print nothing.
- Web: the position select value is the position name. New `toPositionOptions` keeps a template's own position in the list. 20 files and 193 tests pass, typecheck and eslint print nothing. Root `pnpm lint` and `pnpm typecheck` exit 0.

Not done:

- The user runs the migration, restarts the backend, and checks the KPI list, create, edit, and publish flows in the browser (unverified).
- Behavioral Assessment now follows the KPI logic (hersvin agreed, 2026-11-24): `@UseGuards(JwtAuthGuard, AdminRoleGuard)` on the class (every route is admin only, including the two GETs), the company and the actor come from the account through `CompanyResolver` (`KpiGoalsModule` now exports it, `BehavioralAssessmentModule` imports `KpiGoalsModule` and `EmployeeModule` and provides `AdminRoleGuard`), the DTO has no company, and the controller passes `req.user.userId` (it read `req.user.id`, which does not exist). The entity maps `company` text. New controller spec and new service cases (red first). Backend: 15 files, 161 tests, `tsc` and lint print nothing. Not verified: the Nest module wiring at startup (the unit tests do not build the module graph) and a real call of the routes as admin and as a non-admin.
- The contract step (drop the old id columns, `pms.companies`, `pms.positions`, `pms.departments`) needs its own decision.
- The CWE-639 company filter on list, details, and writes stays open. With text it is a plain equality on `company`.

## 9. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-24-kpi-text-and-pms-only.md, and docs/reviews/2026-11-24-auth-pms-schema-review.md first. We are on branch main in C:\Users\mdasalla\Documents\GitHub\performance-management-system with uncommitted changes. Do not create a branch, commit, or push until I say so. Everything lives in schema pms, nothing in public. Do not edit the old handoffs.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done. Read the schema or code before you write SQL or claim a fact. Never run SQL on my database: write the script and I run it.

First task: continue the KPI text change from section 8 of the handoff.
```
