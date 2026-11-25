# Handoff: Behavioral builder, first browser pass and the hydration fix

2026-11-25 · The first browser pass of the behavioral builder ran in the built-in browser pane, logged in by the user as an admin. It confirmed the leave guard, found one defect (a hydration mismatch), and the defect is fixed. Nothing is committed or pushed. Branch `feat/kpi-text-and-behavioral-templates` (PR #9, not merged). This file adds to `2026-11-25-behavioral-builder-leave-guard.md` and edits no older handoff.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. What the browser pass showed (verified in the pane, 2026-11-25)

- Leave guard on the create builder: typing a name and clicking Back opens "Leave without saving?". Cancel keeps the text. Leave goes to the list, and the browser Back button returns to a blank builder with no dialog. All four steps behaved as the tests say.
- Defect: the console reported a hydration mismatch and the Next badge showed "1 Issue". `newBehavioralTemplate()` made the first section and question with `crypto.randomUUID()`, so the server HTML and the browser HTML had different `id` and `htmlFor` values. React does not patch such attributes, so the ids in the page and the ids in the state differ, and the error summary cannot find a field to focus.
- Cause: the KPI editor counts its ids so that both sides render the same ones. The behavioral state module did not.

## 2. The fix

- `web/src/features/review-templates/services/behavioral-template-state.ts`: the first section and question of a new template have the fixed ids `section-1` and `question-1`. Sections, questions, and duplicates added later keep random ids, because the browser makes them after hydration.
- Test first: `tests/unit/behavioral-template-state.test.ts`, "gives the same ids every time". It failed, then passed.
- Verified (commands run): web 32 files and 287 tests pass, `pnpm typecheck` and `pnpm lint` print nothing. In the pane, after a reload the page shows no "1 Issue" badge and the ids are the fixed ones. A fresh tab (empty console) opened on `/new` showed no console message at all, errors included, so the mismatch is gone. The list shows one template, "Quarterly Performance", Version 2, Published (Nov 24, 2026), so an update to version 2 happened before this pass. The pass did not touch it.

## 3. Not checked yet (the pass stopped here because the remaining checks write to the database)

1. Edit page of a draft: after Leave, the stored values return.
2. Save as Draft (the new row lock of `update`), then open the details page.
3. Publish from the builder, from the edit form, and from the details page: the dialog comes first. Publish writes a real row, so use a new test template.
4. Duplicate options "Yes" and "yes": the form refuses, and a direct API call answers 400.
5. Publish a draft that has no section: 400.
6. Edit a published template: version 2 in the list, and the rows of version 1 still in the database (the user runs the SQL).
7. After Update Template, open Edit again: it must show the new version. After a refused save, leave and return: the old error must not show.
8. The 403 for a `user` and a `manager` login, and the KPI edit and publish.

## 4. Constraints

- Do not push to `main`. Do not commit or push until the user says so. Never edit an old handoff. The user runs all SQL and logs in to the pane. Write the failing test first.

## 5. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-25-behavioral-browser-pass-1.md, docs/handoffs/2026-11-25-behavioral-builder-leave-guard.md, docs/handoffs/2026-11-25-behavioral-rule-violations.md, and docs/handoffs/2026-11-24-behavioral-module-status.md first. We are on branch feat/kpi-text-and-behavioral-templates in C:\Users\mdasalla\Documents\GitHub\performance-management-system, and PR #9 is open. Do not push to main. Do not commit or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it. I log in to the browser pane myself.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: continue the browser pass from section 3 of docs/handoffs/2026-11-25-behavioral-browser-pass-1.md, and fix what it shows.
```
