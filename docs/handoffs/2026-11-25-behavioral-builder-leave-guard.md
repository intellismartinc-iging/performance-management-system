# Handoff: Behavioral template builder, the leave guard

2026-11-25 · The behavioral builder now starts over when the user leaves it, warns before a tab close, and asks before the back link discards edits, as the KPI builder does. Nothing is committed or pushed. The branch is `feat/kpi-text-and-behavioral-templates` (PR #9, not merged). This file adds to `2026-11-25-behavioral-rule-violations.md` and edits none of the older handoffs.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Fix a difference from the KPI builder: edits typed in the behavioral builder stayed after the user left the page and came back, with no warning.

## 2. Cause

Next keeps the state of a page the user leaves and shows it again on return. The KPI editor (`kpi-goal-template-editor.tsx`) handles this with three pieces: it keeps the template it opened with, resets to it in an effect cleanup (`useEffect(() => startOver, [startOver])`), and tracks `isDirty` for a browser warning and a "Leave without saving?" dialog on the back link. `behavioral-template-editor.tsx` had a plain `useState` and none of the three.

## 3. Current state

- `web/src/features/review-templates/components/behavioral-template-editor.tsx`: `startingTemplate`, `startOver` (also clears the error summary and the preview), `isDirty` set by every edit, `useUnsavedChangesWarning(isDirty)`, the back link opens `UnsavedChangesDialog` when dirty, and Leave runs `startOver` then `router.push(backHref)`. The details page (`readOnly`) never becomes dirty, so it has no prompt.
- New test file `web/tests/component/behavioral-template-editor-leave.test.tsx` (7 tests). Two of them hide and show the editor inside React's `Activity`, the mechanism that keeps a page, so they prove the reset on return.
- Fixture change, not a weakened test: `behavioral-template-edit-form.test.tsx` and `behavioral-template-details-view.test.tsx` now mock `next/navigation`, because the editor calls `useRouter`.
- Verified on 2026-11-25 (commands run): web 32 files and 286 tests pass, `pnpm typecheck` and `pnpm lint` in `web` print nothing. Five of the seven new tests failed first, for the reasons they test. The other two (no prompt while nothing changed, no prompt on the details page) passed at once, so they were proven by mutation: with `if (!isDirty) return;` removed from the back link, both failed; the line is restored.
- Not verified: a real browser. In particular that `Activity` in the test matches how Next keeps a page in this app (`cacheComponents`), and the dialog look at phone width.

## 4. Decisions

- The same three pieces as KPI, reusing `useUnsavedChangesWarning` and `UnsavedChangesDialog`, so the two builders behave the same.
- No shared hook for the reset yet: two callers with different state shapes. Extract one when a third builder needs it.

## 5. Open items

1. In the browser: type in the create builder, click Back (the dialog appears), Stay (text is kept), Back then Leave (back at the list), open the builder again (it is blank). Repeat on the edit page of a draft: after Leave, the stored values return.
2. After Update Template on a published template, open Edit again: it must show the new version's content, not the old one. `startingTemplate` is state, fixed at the first mount, so if Next keeps that route's instance the form could show version 1, and an update from it would publish version 3 built from version 1. The KPI editor has the same shape, so this is parity, and it is unverified. If it reproduces, the fix is `key={tree.template.currentVersion}` on the editor in both edit forms. Add it only with evidence.
3. The open items of `2026-11-25-behavioral-rule-violations.md` section 7 still stand.

## 6. Constraints

- Do not push to `main`. Do not commit or push until the user says so. Never edit an old handoff. The user runs all SQL. Write the failing test first.

## 7. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-25-behavioral-builder-leave-guard.md, docs/handoffs/2026-11-25-behavioral-rule-violations.md, and docs/handoffs/2026-11-24-behavioral-module-status.md first. We are on branch feat/kpi-text-and-behavioral-templates in C:\Users\mdasalla\Documents\GitHub\performance-management-system, and PR #9 is open. Do not push to main. Do not commit or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: ask me what I saw in the browser pass (section 5 of this file, and section 7 of the rule-violations file), then fix what I report.
```
