# Handoff: Behavioral Assessment templates, status against the PRD (start here)

2026-11-24 · A review of the behavioral template module against section 5 of the PRD (`docs/product-requirements-document.md`, lines 370 to 470, Tpl-B-001 to Tpl-B-004). Verdict: **the module is not finished.** The flow of a draft and of a next version works. The items below are missing. Nothing was changed in code for this file.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Read in this order

1. This file.
2. `2026-11-24-behavioral-template-new-version.md` (latest state of the code and the checks that were run).
3. `2026-11-24-behavioral-template-details-and-edit.md`, then `2026-11-24-behavioral-template-web.md`.
4. `2026-11-24-kpi-text-and-pms-only.md` for the rest of the day (auth on `pms`, the KPI text change, the dropped `public` tables).

The older files were not edited, because `AGENTS.md` and `CLAUDE.md` forbid it. Where an older file disagrees with a newer one, the newer one wins. Statements that are out of date today:

- `...-web.md` and `...-details-and-edit.md`: "a published template cannot be edited yet", "no new-version route", the review types without `hr`, and the options textarea. All four were changed (see `...-new-version.md`, section 3).
- `...-kpi-text-and-pms-only.md`: the behavioral interim change (client-sent company) and the open items about behavioral. Superseded by `...-web.md`.

## 2. What "finished" means here

The PRD section covers three modules: authoring the templates (this module), answering them (evaluations: Tpl-B-002 scoring and the required-answer half of Tpl-B-003), and selecting a template in a cycle with a frozen snapshot (cycles: Tpl-B-004). Only authoring is in scope. The other two are not built, and are not counted below.

## 3. Verdict, one row per PRD item

| Status                                  | Items                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done in code                            | Create, preview, save as draft, publish, edit a draft, and the next version of a published template (Tpl-B-001 without archive). The four question types, the required flag, and Not Observed for rating questions. An admin guard on every route (5.8). The details page. Multiple choice needs at least two different options in the web (case compared).                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Not done, PRD-required                  | **Archive** (Tpl-B-001, 5.3): the column and the status exist, no route and no button. **Company scoping** of the list, the details, and every write (5.2, COM-006): the list returns every company's templates, and no route checks the company of the template. **Section and question counts in the list** (5.2). **Audit events** (5.7): `pms.audit_events` exists, nothing writes to it (same for KPI).                                                                                                                                                                                                                                                                                                                                                                                                                |
| Not done, PRD violated by existing code | `publish()` freezes a draft with no section and no question, and the create DTO accepts an empty `sections` array (Tpl-B-003: block invalid publication). The API does not reject duplicate options: only the DB `UNIQUE (question_id, label)` does, and it compares exact text. `create` saves the template (service line 79), the version (line 88), then the sections (line 90) with no transaction, so a direct call with the options "Yes" and "Yes" leaves a template, a version, a section, and a question behind and then fails: a partial mutation (5.11). The exception filter has no case for the unique violation, so the answer is a general 500 (the body of that 500 was not read: unverified). `update` and `publish` are not transactional either. Publish is irreversible and has no confirmation (5.11). |
| Parity with KPI and legacy, not PRD     | Search, filters, and pagination of the list. Duplicate template. The order of the options: `pms.behavioral_choice_options` has no sort column, so the options come back in no promised order, on the form that evaluators answer. The question description of the legacy form (no column).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Not verified                            | A browser pass: publish a draft, edit a published template, version 2 in the list with the rows of version 1 still in the database, the 403 for `user` and `manager`, and the KPI edit and publish after the `/S/` fix. `next build`. A viewport and theme pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## 4. Suggested order of work

1. The three small violations, each with a failing test first: a content check in `publish()` and in `create` and `update` of a published or publishing path (at least one section, a question in every section), duplicate and blank options rejected with a 400 before any write, and one transaction around `create`, `update`, and `publish` (the new `createVersion` is the model). Add a confirmation before publish in the web.
2. The browser pass, with the user, and fix what it shows.
3. Needs hersvin, because the code is shared with KPI or in his module: archive (route, button, the PRD rule that an archived template is unavailable for new cycle selection), company scoping (the same filter for list, details, and writes, in both modules), audit events, and a sort column for the options.
4. List summary (counts), search, filters, and pagination, and duplicate: not in the PRD, in the legacy flow.

## 5. Constraints

- Do not push to `main`. Do not create a branch, commit, or push until the user says so. Read `AGENTS.md`, `CLAUDE.md`, `backend/AGENTS.md`, and `web/AGENTS.md` first.
- Never edit an old handoff: write a new dated file. The user runs all SQL: write the script, never connect to the database.
- Write the failing test first. Call the advisor before the approach and before you say the work is done. Replies in Taglish and Caveman ultra, following `.claude/skills/writing-rules/SKILL.md`. No em dashes. Write any file that holds a regex or a backslash with the Write tool, and grep it after.

## 6. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, and docs/handoffs/2026-11-24-behavioral-module-status.md first, then the files that it lists in section 1. We are on branch main in C:\Users\mdasalla\Documents\GitHub\performance-management-system with uncommitted changes. Do not create a branch, commit, or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: ask me which gap of section 3 to do first, and start with the failing test.
```
