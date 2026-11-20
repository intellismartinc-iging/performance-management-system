# Handoff: KPI verification, architecture doc, and docs drift

2026-11-20 · One session that verified the second HR account and the KPI Goal Templates module in a browser, removed the Archived filter option, wrote `docs/system-architecture.md`, corrected stale project docs, and merged all of it in PR #7. No module was finished in this session.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Keep the KPI Goal Templates module and its docs accurate on `main`. The next work is one of the open items in section 8. The user picks it.

## 2. Current State

- Branch `main` equals `origin/main` at `8c8e53f` (merge of PR #7, https://github.com/iti-vin/performance-management-system/pull/7). PR #7 holds five commits: `3dafbb2` (Archived option removed from the Status filter, with a test), `e42f2e4` (new `docs/system-architecture.md` and four corrected docs), `6053cb9` (`AGENTS.md` lean-code item 7), `0645c54` and `bffb11a` (handoff updates).
- This handoff was committed on `main` as `017c285` and pushed straight to `origin/main` at the user's explicit request, because it changes docs only. That overrides the rule "do not push to main" for this commit only. The local branch `fix/handoff-2026-11-20` is empty and equals the old `8c8e53f`.
- Second HR account: `pms-add-hr-account.sql` ran. `pms.employees` id 24 is Lebron James (hrdotnet_id 23, company 1, department 1, GUID `6a685ca5-...`). A new draft by this account has `created_by` = Lebron James, `published_by` NULL, `frozen_at` NULL, `current_version` 1.
- Browser pass of the KPI Goal Templates module: the user reported checks 1 to 7 as passed. Seen in screenshots: draft details (Edit Draft and Publish Template only), published details (Edit Template only), the edit page with locked Measurement Unit and Achievement Direction on the saved indicator and open selects on the new one, the Update Template confirm dialog ("This publishes version 2. Cycles that already use version 1 keep it."), the list row at Version 2, the Leave dialog, and the blank builder. The DB showed version 1 unchanged (weight 100) and version 2 with two indicators (50 and 50) created by Lebron James.
- Last verified commands (this session, `web` only): `pnpm exec vitest run` printed 19 files and 188 tests passed, `pnpm exec tsc --noEmit` and `pnpm exec eslint src tests` printed no errors. The root `pnpm test`, the backend tests, and `pnpm build` were not run in this session.
- Not verified: the four Mermaid diagrams in `docs/system-architecture.md` were never rendered. The gaps marked "(handoff)" in that file were not re-checked in the code. The user reported the viewport, theme, and keyboard checks as passed without saying which sizes, themes, or keys. Whether the SQL Server login of HRDotNet is limited to read access is unknown.

## 3. Key Decisions & Rationale

- Commit and push only on an explicit instruction: the user corrected the session once ("wala pa akong sinasabi na mag commit"). A later message asked for commit, push, and PR together, and that one was followed.
- The Archived removal changes only the option list of the Status filter: the user asked to remove the select item. Rows with status archived still show on the All tab and `?status=archived` still parses, because nothing else was asked.
- `docs/system-architecture.md` keeps the five section headings of the template and says "Not recorded" where the repository records no alternative or rationale: the doc must not invent decisions.
- Section 3 of that doc is generated from `git ls-files` plus the file itself: this guarantees no tracked file is missing (482 of 482 paths matched).
- Only facts checked against the code were corrected in `README.md`, `docs/README.md`, `docs/project-structure.md`, and `docs/handoffs/README.md`: the user asked to fix the stale details, and unverified claims (the backend test status) were left alone.
- The PR went from the `fork` remote branch to `iti-vin/performance-management-system` `main`: PR #6 used the same path.
- The branch kept the name `fix/docs-drift` though it also holds one web fix: reason not stated.
- This handoff is a new dated file and not an update of `2026-11-19-kpi-goal-templates.md`: the user asked for a handoff at the end of a session that finished no module, and the `handoff` skill writes a new snapshot. `AGENTS.md` says to update one file per module while the module continues. Both rules exist.

## 4. Dead Ends (Do Not Retry)

- A SQL query with `t.created_by` on `pms.kpi_goal_templates`: `created_by` is on `pms.kpi_template_versions`. Read `packages/database/schema/kpi-goals.sql` before writing SQL.
- A query filtered by a template name that the user had not used returned zero rows. List the latest rows without a name filter.
- Committing after the user answered "yes" to a commit question: the user had not asked for a commit. The commit was reset with `git reset HEAD~1` and the work went back to uncommitted on `main`.
- `screen.getAllByRole("option")` right after opening the Base UI select fails: use `findAllByRole`.
- Long shell heredocs with quotes (from the earlier handoff): use the Write tool or a `.cjs` script in the scratchpad.

## 5. Artifacts and File Changes

All paths under `C:\Users\mdasalla\Documents\GitHub\performance-management-system`.

- `docs/system-architecture.md` (1,135 lines): completed, merged in PR #7.
- `README.md`, `docs/README.md`, `docs/project-structure.md`, `docs/handoffs/README.md`: completed, merged in PR #7.
- `docs/handoffs/2026-11-19-kpi-goal-templates.md`: completed (updated with the second HR account, the browser pass, and the description gap), merged in PR #7.
- `AGENTS.md` (item 7): completed, merged in PR #7.
- `web/src/features/review-templates/components/goal-template-listing.tsx` and `web/tests/component/goal-template-listing.test.tsx`: completed, merged in PR #7.
- `docs/handoffs/2026-11-20-session-kpi-verification-and-architecture-doc.md` (this file) and its row in `docs/handoffs/README.md`: completed, pushed to `main` (`017c285` and a correction commit after it).
- `progress-report-result.md`: written, gitignored, local only.
- Scratchpad helpers `build-architecture-doc.cjs`, `verify-architecture-doc.cjs`, and `system-architecture.template.md` in `C:\Users\Admin\AppData\Local\Temp\claude\a97f5968f73a2f66\16414b4c-a52f-46a7-a396-f000b0903df0\scratchpad\`: unverified after a reboot, because a reboot or cleanup clears this folder. They are not in the repository.
- Local branches: `fix/remove-archived-status-option` (empty, equals the old `a564b2c`), `fix/docs-drift` (merged), `feat/kpi-goal-templates` (merged earlier), and `docs/project-documentation` (ahead 3, behind 2, unrelated to this work). `git ls-remote --heads fork fix/docs-drift` returned nothing, so the fork branch is gone or was never listed.

## 6. Verbatim Essentials & Constraints

- Do not push to `main`. Create a `feat/` or `fix/` branch before you edit a tracked file. Do not commit or push unless the user asks.
- Push work to the remote `fork`, then open the PR against `iti-vin/performance-management-system` `main` with `gh pr create --repo iti-vin/performance-management-system --base main --head intellismartinc-iging:<branch>`.
- A PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. A commit message ends with the `Co-Authored-By` line of the session reminder.
- PR ceiling in the progress-report command: about 15 files and 500 lines. PR #7 was above it (about 1,240 added lines) and said so.
- Never send the daily Outlook email or submit the form without an explicit "send" or "submit" in the same turn.
- Table names: KPI templates live in schema `pms`: `kpi_goal_templates` (status, `published_by`), `kpi_template_versions` (`created_by`, `frozen_at`), `kpi_indicators`. A draft has `current_version` 1.
- Accounts: admin001 (user 4, Iging DotTech, hrdotnet_id 1, GUID `284ddc9e-...`), `lebronjames...` (user 10, `pms.employees` id 24, GUID `6a685ca5-...`).
- Commands from the repo root: `pnpm build:packages` after any `packages/shared-types/src` edit. Web: `pnpm exec vitest run`, `pnpm exec tsc --noEmit`, `pnpm exec eslint src tests`.
- The user asked that replies follow `.claude/skills/writing-rules/SKILL.md`.

## 7. Working Preferences & Writing Rules

- Replies in Taglish, Caveman style at tier `ultra`: short fragments, exact commands, paths, and negations. Follow writing-rules: no em dashes, no Latin abbreviations, no semicolons or asterisks in prose, no banned words (for example however, just, very, really, actually, robust, leverage), active voice, present tense.
- Lean-code is on: check the reuse ladder, write the failing test first, end each coding task with a Lean Report (requirement, rung, evidence, lines; deferred items with triggers; the command run and its result). Never cut validation, security, data safety, accessibility, or tests.
- Call the `advisor` tool before a complex approach and again before declaring done. Orientation first, then advisor, then write. Fix what it flags or say why not.
- Read the schema or the code before you write SQL or claim a fact. The user checks queries and screenshots and reports errors.
- Be honest about what was not run or seen. The user wants "unverified" marked, not guessed.

## 8. Open Items & Immediate Next Steps

- Next action: ask the user which open item to do next.
- Gap (from the KPI handoff): company scoping of the list, details, and write routes is not enforced (CWE-639). Needs the backend owner.
- Gap: `name` and `description` live on `kpi_goal_templates`, not on the version row. Editing a published template changed the description of version 1 too. Decide whether they belong on the version.
- Gap: one generic "HR access required" notice for both a role refusal and "No company is linked to your account".
- Gap: indicator identity across versions is not persisted. `IndicatorDto.unit` is optional in the backend and required in the shared schema. No duplicate template name check. The details page has no Preview.
- Gap: schema drift between `synchronize: true` entities and `schema.sql`: the `behavioral_questions`, `users`, and `user_role` entities declare no schema (they map to `public`), and `schema.sql` defines `pms.behavioral_questions` and `pms.user_role`.
- Gap: `AdminRoleGuard` is shared by `employees` and `kpi-goals` but lives in `employees/guards/`. `BehavioralAssessmentController` and `GET /employees` have `JwtAuthGuard` only.
- Gap: `@nestjs/terminus` and `nodemailer` are declared and unused. Both `bcrypt` and `bcryptjs` are declared. `ObserveModule.forRoot` receives literal placeholder keys.
- Unexplained: a published template by Lebron James exists with `created_at` 2026-11-19 17:12, before the old handoff called the account blocked.
- Unverified: CI leaves out the backend and database tests with a recorded reason, while the 2026-11-19 handoff reports 179 backend tests passing locally. Re-check, then decide on CI.
- Unverified: render the Mermaid diagrams in `docs/system-architecture.md` and re-check the "(handoff)" gaps in the code.
- Cleanup, only when the user asks: delete the empty local branch `fix/remove-archived-status-option` and the merged branches.
- Teammates who pull `main` need the ALTER scripts under `.codex/scripts` (local, gitignored), the `pms.employees` account link step, and the gaps above.
- Blocked: nothing.

## 9. Suggested Opening Prompt for Next Session

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, docs/handoffs/2026-11-19-kpi-goal-templates.md, and docs/handoffs/2026-11-20-session-kpi-verification-and-architecture-doc.md first. We are on branch main (synced with origin/main, PR #7 merged) in C:\Users\mdasalla\Documents\GitHub\performance-management-system. Do not push to main: create a new feat/ or fix/ branch before you edit tracked files. Do not commit or push unless I ask.

Rules for this session:
- Replies in Taglish, Caveman ultra, and follow .claude/skills/writing-rules/SKILL.md. Lean-code on: end each coding task with a Lean Report.
- Call the advisor tool before you commit to an approach on anything complex, and again before you say the work is done. Orientation first, then advisor, then write. Fix what it flags or tell me why not.
- Write the failing test first. Read the schema or code before you write SQL or claim a fact. Never send or submit a daily log without my explicit "send" or "submit".

First task: ask me which open item in section 8 of the 2026-11-20 handoff to do next.
```
