# Handoff: KPI Goal Templates module

2026-11-19 · The KPI Goal Templates module (list, details, create, edit, publish new version) is built across shared-types, backend, and web on `feat/kpi-goal-templates`; nothing is committed and nothing was checked in a browser.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Finish and land the KPI Goal Templates module by copying the legacy flow at `C:\Users\mdasalla\Documents\GitHub\pms-be\frontend\legacy`. The next work is a browser pass, the commit, and the open gaps in section 8.

## 2. Current State

- Branch `feat/kpi-goal-templates`. Committed locally in four commits, each separate: `3edb55e` shared-types and database, `e734f4a` backend, `b47c17b` web, and a last commit for every `.md` file (AGENTS.md, CLAUDE.md, docs, this handoff, web/DESIGN.md). The user asked for the push to the remote `fork`, branch `feat/kpi-goal-templates` (`git push -u fork feat/kpi-goal-templates`); check `git log fork/feat/kpi-goal-templates` to see whether it landed. Do not push to `origin` or `main`. After this point, commit only when the user asks.
- Last verified results, run just before the commits: `pnpm build:packages`, shared-types 76 tests, database 9 tests, backend 179 tests with `tsc --noEmit` and `oxlint` clean, web `tsc` and `eslint` clean, web 187 tests, and `pnpm build` passing.
- Never run: any check in a real browser (viewport, theme, keyboard), or the new reset-on-leave effect cleanup in a real browser (only the Leave-button path has a test). The database behavior was seen only through the user's own queries (templates saved, versions 1 and 2 created, `created_by` shows the right person).
- Working in the app (as reported by the user's queries): create draft, publish, edit published (v2 created), saves recorded under "Iging DotTech" (employee GUID `284ddc9e-ebe4-468d-945f-fb18af72e6...`).
- Second HR account `lebronjames...` (public.users id 10, employee id 5, hrdotnet_id 23, GUID `6a685ca5-7613-4e80-a384-4ebe60263a...`) is blocked: no row in `pms.employees`, so the builder page shows "HR access required". The fix script exists and is NOT run yet (section 5).
- Details page shows status badge and version. Buttons per status: draft = Edit Draft + Publish Template; published = Edit Template; archived = none. No Duplicate, no Archive, no Preview on details (the user asked to remove Duplicate and Archive).

## 3. Key Decisions & Rationale

- Editing a published template = copy-on-write: `POST /kpi-goals/:id/versions` creates version N+1, frozen and published at once, old version kept: cycles that already use version N must keep it. Legacy made it a draft; this does not (reported to the user as a difference).
- Server enforces that a saved indicator of a published template cannot change Measurement Unit or Achievement Direction: the UI lock alone is bypassable. The UI disables the two selects only for indicators that came from the server; new indicators stay open.
- Publish (draft or update) requires weights to total 100 (`weightsTotalHundred`, tolerance 0.01) and at least one indicator: shared rule `Tpl-G-003`; drafts may save any weights.
- `created_by` / `published_by` are uuid = `pms.employees.guid`, resolved by `CompanyResolver.resolveAccount(userId)` (users.employee_id -> public.employees -> pms.employees by `hrdotnet_id`, then by `code`; Forbidden unless exactly one company): the login `userId` is a number and cannot go in a uuid column (this caused `invalid input syntax for type uuid: "4"`).
- Never create TypeORM entities for `pms.employees` or `pms.positions`; read them with raw SQL: with `synchronize: true` a partial entity makes TypeORM drop the other columns. Type changes of a column are drop+add (data loss), so ALTER scripts are run by the user first.
- Matrix and score rules live once in `@pms/shared-types` (`indicatorMatrixErrors`, `defaultScale`, `scaleScore`, `scaleBoundarySamples`, `scaleDirectionConflicts`, `hasAtMostTwoDecimals`, `isValidIndicatorScore`, `MATRIX_LIMITS`): so the API, the save schema, and the editor accept the same bodies.
- Matrix storage expanded into tables (scales, matrix rows, matrix columns, matrix cells): the user chose "Palawakin ang mga table". Scale scores are decimal (numeric(3,2)): the user chose "Oo, decimal din".
- Percentage rule: unit "Percentage" caps Target Value at 100, in shared schema (`targetExceedsUnit`, `PERCENTAGE_TARGET_MESSAGE`), backend (`assertIndicatorScores`), and the editor (typed value above 100 becomes 100; switching unit to Percentage clamps the target). Reason: the user asked.
- Score inputs (Score When Target Is Met / Missed) are number inputs again, with a guard: a typed value above 5 becomes 5. A dropdown was built and then reverted at the user's request. Weight: typed value above 100 becomes 100; weight must be above 0 (backend `Min(0.01)`).
- Next 16 `cacheComponents` keeps the state of pages you leave. Fixes: pages key the details and edit views with `stateKey(detail)` (id, status, version, updatedAt); the editor keeps a `startingTemplate` and calls `startOver()` on Leave and in an effect cleanup. Reason: a stale server error and a stale Leave dialog came back on return.
- Server actions validate `templateId` with `idSchema` before building a request path (advisor finding, blocking): a server action accepts any string from the client.
- Shared rule files moved to `packages/shared-types/src/rules/` (`kpi-matrix.ts`, `kpi-weights.ts`, `kpi-target.ts`): `domain/` is for enums and `dtos/` for schemas. `goal-template-path.ts` moved to `web/src/constants/`: it is a route constant, not a feature file.
- The legacy "Template name / Description" were kept in the builder and put in "Basic Information" (user preference for that heading).
- Wording pass (legacy style): Template Name *, Applicable Position / Role (required marker), Description (no "(optional)"), Indicator Name, Measurement Unit, Target Value, Achievement Direction, Score When Target Is Met, Score When Target Is Missed; intro "Weights total 100%. Each indicator defines its direction and scoring criteria on a five-point scale."; back link "Back to KPI Goal Templates" (on edit: "Back to Template Details").

## 4. Dead Ends (Do Not Retry)

- Score dropdown (1 to 5 in 0.5 steps): the user wanted inputs back, with a max-5 guard instead.
- Duplicate and Archive buttons and actions on details: the user asked to remove them. The code was deleted. `?saved=archived` in the saved notice is now unused (harmless).
- Edit Template button on a draft: the user said a draft must show Publish Template. The draft shows Edit Draft + Publish Template.
- Long shell heredocs with quotes: they fail on this machine. Use the Write tool or a `.cjs` script in the scratchpad. JS `String.replace` treats `$$` in the replacement as one `$`: restore `$$` after any replace that writes dollar-quotes.
- `vi.fn().mockClear` keeps once-queues: use `mockReset` for `manager` mocks.
- `z.uuid()` rejects fixture GUIDs: use `idSchema = z.guid()`.
- A route declared after `:id` is never reached: `GET kpi-goals/positions` stays before `:id`.
- Number-spin arrows: removed on all number inputs at the user's request.

## 5. Artifacts and File Changes

All paths under `C:\Users\mdasalla\Documents\GitHub\performance-management-system` unless noted. All uncommitted.

shared-types (completed, built with `pnpm build:packages`):

- `packages/shared-types/src/rules/kpi-matrix.ts`, `kpi-weights.ts`, `kpi-target.ts`: completed
- `packages/shared-types/src/dtos/goal-template.schema.ts` (name, description, `indicatorId` optional, matrix fields, percentage rule): completed
- `packages/shared-types/src/index.ts`, `domain/matrix-kind.enum.ts`, `domain/scale-bound.enum.ts`, generated `rows/*` (matrix cells row new): completed
- `packages/shared-types/test/` new tests (goal-template-request, goal-template-response, ids, kpi-matrix, kpi-target, kpi-weights): completed
- `packages/database/schema/kpi-goals.sql`, `seeds/kpi-goals.sql`, `schema.test.mjs`, `docs/database-design.md`, `docs/database-schema.md`: completed

backend (`backend/src/modules/kpi-goals/`): completed

- `services/kpi-goals.service.ts` (create, update, publish with weights check, `createVersion`, `assertPublishedIndicatorsKeepUnitAndDirection`, percentage check), `services/company-resolver.service.ts` (`resolveAccount`), controller (`POST :id/versions`), DTOs, entities (matrix cell entity new), `kpi-goals.module.ts`, `app.module.ts`
- Specs: `kpi-goals.service.spec.ts`, `kpi-goals.controller.spec.ts`, `kpi-goal-template-contract.spec.ts`, `company-resolver.service.spec.ts`
- Routes: GET list, GET positions, GET :id, POST create, POST :id/update, POST :id/versions, POST :id/published, POST :id/archived. Guards: `JwtAuthGuard`, `AdminRoleGuard` on all.

web (`web/src/`): completed

- `app/(workspace)/reviews/templates/kpi-goal-template/page.tsx`, `new/page.tsx`, `[templateId]/page.tsx` (details), `[templateId]/edit/page.tsx`
- `features/review-templates/components/`: `kpi-goal-template-editor.tsx` (builder, read-only details mode, draft edit, published edit with locks, `statusLine`, `headerActions`, `SaveIntent`), `indicator-matrix-editor.tsx`, `goal-template-details-view.tsx`, `goal-template-edit-form.tsx` (Update Template confirm dialog), `goal-template-create-form.tsx`, `goal-template-create-action.tsx`, `goal-template-listing.tsx`, `goal-template-list.tsx`, `goal-template-notice.tsx`, `goal-template-saved-notice.tsx` (flags draft, published, updated, archived, publish_failed)
- `features/review-templates/services/`: `goal-template-editor-state.ts` (`fromGoalTemplateDetail`, `stateKey`), `template-requests.ts` (`toSaveGoalTemplateRequest(template, { keepIds })`), `manage-goal-template.ts` (`saveGoalTemplateEdits`, `publishGoalTemplate`), `create-goal-template.ts`, `goal-template-reader.ts`, `goal-template-format.ts`, `goal-template-selection.ts`, `indicator-matrix.ts`
- `features/review-templates/api/goal-template-requests.ts`; `constants/goal-template-path.ts`; shared pieces edited: `components/molecules/form-select.tsx` (optional `id`), `listing-tabs.tsx`, `organisms/data-table.tsx`, `constants/domain-labels.ts`, `layouts/workspace-layout.tsx`, `styles/layout.css`, `app/globals.css`, `DESIGN.md`
- Tests in `web/tests/` (component, integration, unit): completed. Includes `goal-template-edit-modes.test.tsx`, `manage-goal-template.test.ts`, `goal-template-editor-state.test.ts`.

Repo instructions: `AGENTS.md` (advisor rule tool-neutral; lean-code and caveman ultra rules) and `CLAUDE.md` (advisor rule) modified: completed.

User database scripts (gitignored `.codex/scripts/`):

- `pms-directory-setup.sql`: the user ran it
- `kpi-score-numeric.sql`: the user ran it
- `kpi-templates-slice.sql` (name/description, matrix DDL, `use_for_scoring` backfill): the user was told to run it with the backend stopped; saving a template works, so it very likely ran, but the user never confirmed it formally
- `pms-link-hr-account.sql`: ran and verified (row 21 of `pms.employees` is now Iging DotTech; old versions moved to the real GUID; every template row shows Iging DotTech)
- `pms-add-hr-account.sql`: written, NOT run. It adds a `pms.employees` row for public.users id 10 with defaults company 1, department 1, no position, new id = max(id)+1. The user must run it (F5, one script) and may change company/department first.
- `.codex/prompts/ui-redesign.md`: Codex prompt, completed

Other:

- `C:\Users\mdasalla\Documents\GitHub\daily-logs\reports\2026-11-19.md`: the morning log. The Outlook draft was prepared and NOT sent (22 To, 1 Cc). Send only when the user says "send". Not committed.
- `docs/handoffs/2026-11-19-kpi-goal-templates.md`: this file.

## 6. Verbatim Essentials & Constraints

- Branch: `feat/kpi-goal-templates`. Do not push to `main`. Do not commit unless the user asks.
- Legacy to copy: `C:\Users\mdasalla\Documents\GitHub\pms-be\frontend\legacy`.
- Button rules (the user's words in summary): draft details = "Edit Draft" and "Publish Template" only; published details = "Edit Template"; no Duplicate, no Archive. Edit page: draft = Preview, Save as Draft, Publish Template; published = Update Template (Preview kept).
- Locked on a published template (saved indicators only): Measurement Unit and Achievement Direction. Nothing else.
- Percentage unit: Target Value 0 to 100. Weight: above 0, up to 100. Scores: 1 to 5, at most two decimals, typed value above 5 becomes 5. Total weight must be 100 to publish or update.
- Fixture employees (`pms.employees`): id 21 now the real HR (Iging DotTech); id 22 Maria Santos (hrdotnet_id 2, GUID `00000000-0000-0000-0000-000000000022`); id 23 Ramon Reyes (hrdotnet_id 3, `...023`). Any new account whose `hrdotnet_id` or `code` collides with these is recorded as the fixture person.
- Accounts: admin001 (user 4, Iging DotTech, hrdotnet_id 1); `lebronjames...` (user 10, hrdotnet_id 23, blocked until `pms-add-hr-account.sql` runs). Login chain tables: `public.users.employee_id` -> `public.employees` (columns: id, guid, code, email, first_name, last_name, hrdotnet_id, user_role_id, status; no company) -> `pms.employees`.
- Version rows: the verify queries join versions, so 4 templates show as 6 rows (two templates were edited to v2). Two templates share the name "Software Engineer Performance Goals" (created at 12:39 and 16:39): there is no duplicate-name check.
- Commands from the repo root: `pnpm build:packages` after any `packages/shared-types/src` edit; shared tests need that build first; backend `pnpm --filter @pms/backend test`, lint, and `exec tsc --noEmit -p tsconfig.json`; a Nest build deletes `dist`, so run it only with the backend dev server stopped; web `pnpm exec tsc --noEmit`, `eslint src tests`, `vitest run`, `pnpm build`.
- Read `web/llm.txt` before adding a file to a web folder. Read `node_modules/next/dist/docs/` before using a Next API. Next 16 `cacheComponents`: async server components inside Suspense; `params` and `searchParams` awaited inside Suspense; `redirect()` outside try/catch.
- `AGENTS.md`: write the failing test first; no `any`, no `enum` keyword, no cast to hide a type error; no em dashes, no Latin abbreviations, no emojis; backend belongs to the backend developer: change only what the task names (the user is full stack and approved backend work for this module).

## 7. Working Preferences & Writing Rules

- Replies in Taglish, Caveman style at tier `ultra` (short, exact commands, paths, negations). Lean-code is on: check the reuse ladder, end each coding task with a Lean Report (requirement, rung, evidence, lines; deferred items with triggers; the command run and its result), never cut validation, security, data safety, accessibility, or tests.
- Always consult the `advisor` tool before committing to an approach on complex work and again before declaring done. The user wants this so that lower models do not struggle. Orientation first, then advisor, then write. Fix what the advisor flags, or tell the user why not.
- Prompts for other tools follow the prompt-master skill. UI work follows `design-engineering`, `ui-ux-principles`, `forms-validation`, and `web/DESIGN.md`; shared components first, then shadcn primitives.
- The user asks "bakit ganon" about wrong behavior in screenshots: find the root cause in code, not a patch, and say honestly when the cause is inferred and not reproduced.
- Never send the daily Outlook email or submit the form without an explicit "send" or "submit" in the same turn. The morning draft is draft-only. The evening (afternoon) log is a separate flow from the `daily-log` skill at `C:\Users\mdasalla\Documents\GitHub\daily-logs\.claude\skills\daily-log\SKILL.md`.
- Commit messages: present tense, active voice, no emojis; end with the attribution line given in the session reminder.
- Tool quirks: write long files with the Write tool; `.cjs` helper scripts go in the scratchpad dir; many files have CRLF (normalize in scripts); re-read a file before an Edit when a system note says it changed on disk.

## 8. Open Items & Immediate Next Steps

- Next action 1: the user runs `.codex/scripts/pms-add-hr-account.sql` (change company/department first if needed), then logs in as `lebronjames...` and opens the builder. Confirm it saves under GUID `6a685ca5-...`.
- Next action 2: browser pass (nothing was checked in a browser): draft details buttons; published details and edit (Update Template confirm, locked unit and direction on saved indicators, open on new ones); percentage cap at 100; weight and score caps; Back, Leave, and return to `/new` shows blank and no dialog; after Save as Draft the page does not keep old text. Report viewport, theme, and keyboard checks actually run.
- Next action 3: the commits exist (see section 2). Remaining: confirm the push landed, then open the PR when the user asks. The branch is about 100 files, above the PR ceiling of about 15 files and 500 lines in the progress-report command: say so in the PR, or split it if a reviewer asks. `progress-report-result.md` is gitignored and local. PR note for teammates: the ALTER scripts under `.codex/scripts` (stop the backend first for `kpi-templates-slice.sql`), the `pms.employees` account link step, and the gaps below.
- Gap: company scoping of the list, details, and write routes is not enforced (CWE-639): every admin sees every template. Needs the backend owner's decision.
- Gap: the page shows one generic "HR access required" notice for both a role refusal and "No company is linked to your account". Offered to the user, not done: show the real reason.
- Gap: indicator identity across versions is not persisted (`createVersion` writes fresh ids; unit and direction lock matches by the ids the client sends).
- Gap: `IndicatorDto.unit` is optional in the backend DTO while the shared schema requires it.
- Gap: no duplicate-name check; `saved=archived` flag unused; `security-auditor` pass was done by hand in the advisor review only (main finding was the `templateId` check, fixed); no full `security-auditor` run on the final state.
- Gap: the details page omits Preview (legacy had it); published Update publishes at once (legacy made a draft); rows open details, not the builder.
- Gap: `pms-link-hr-account.sql` and `pms-add-hr-account.sql` assume company 1 and department 1 exist, and that no other table has a foreign key on `pms.employees.guid`. If a script fails on a foreign key, send the exact message.
- Gap: real `pms.employees` data is still placeholder; there is no sync from HRDotNet. Each admin needs a correct row.
- Blocked: the second admin's builder, until the add-account script runs.
- Other work tracked separately by the user: auth acceptance and production hardening.
- Daily logs: the morning log draft is unsent (waiting on "send"). The evening log: `reports/2026-11-19-done.md` is written and a dry run was started; it is unsubmitted (waiting on "submit"). Neither was committed.

## 9. Suggested Opening Prompt for Next Session

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, and docs/handoffs/2026-11-19-kpi-goal-templates.md first. We are on branch feat/kpi-goal-templates in C:\Users\mdasalla\Documents\GitHub\performance-management-system. Do not commit unless I ask.

Rules for this session:
- Replies in Taglish, Caveman ultra. Lean-code on: end each coding task with a Lean Report.
- Call the advisor tool before you commit to an approach on anything complex (change across shared-types, backend, web; an access rule; a schema change; a bug that resists a first fix), and again before you say the work is done. Orientation first, then advisor, then write. Fix what it flags or tell me why not.
- Write the failing test first. Never send or submit a daily log without my explicit "send" or "submit".

First task: I run .codex/scripts/pms-add-hr-account.sql for the second HR account (user 10), then you help me verify the builder works for it and walk me through the browser checks in section 8 of the handoff. Then, when I say so, split the work into logical commits. Ask me which item in section 8 to do next if I do not say.
```
