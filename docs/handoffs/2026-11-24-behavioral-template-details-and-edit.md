# Handoff: Behavioral Assessment templates, details, edit draft, and publish

2026-11-24 · The web now has the whole draft flow of a behavioral assessment template: list, create, details, edit a draft, and publish a draft. It follows `2026-11-24-behavioral-template-web.md`, and corrects it in section 3.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Finish the behavioral assessment templates in the web, as far as the backend can store them, and check them in the browser. What is left is a browser pass with the three kinds of login, and the backend routes that decide the rest (archive, duplicate, new version).

## 2. Current state

- Branch `main` equals `origin/main` at `fbaa8a6`. Everything is uncommitted. No branch exists. The user wants no branch, commit, or push until the module is finished.
- The user ran `packages/database/migrations/2026-11-24-behavioral-template-details.sql` (the four columns came back nullable `text`) and created a draft in their own Chrome. Query output pasted by the user: one row in `pms.behavioral_templates` (company `Mayon Consolidated Inc.`, name, `general_performance`, `hr`, `draft`, version 1), two sections in order, `allow_not_observed` true, false, and null by type, four options of the multiple choice question, and `created_by` equal to the employee GUID of Iging DotTech (admin001). So the create flow works end to end.
- New in the web (all with tests first): the details page `behavioral-assessment-template/[templateId]` (the form as text, the status and version as words, Edit Draft and Publish Template for a draft, a note that a published template cannot be edited yet), the edit page `[templateId]/edit` (a draft only: any other status redirects to the details page), and the server actions `saveBehavioralTemplateEdits` (update, then publish for the publish intent, redirect to the list with `?saved=`) and `publishBehavioralTemplate`.
- Verified on 2026-11-24 (commands run): web 30 files and 264 tests pass, typecheck and eslint print nothing. Backend 16 files and 169 tests pass, `tsc` prints nothing. `@pms/shared-types` 90 tests pass. `@pms/database` 13 tests pass. Root `pnpm lint` and `pnpm typecheck` print no error. The trees of `docs/system-architecture.md` match the working tree (518 of 518 files).
- Not verified: the details page, the edit save, and the publish in a browser (the user's list row linked to a page that did not exist yet, so it gave a 404 until this slice); the 403 for the `user` and `manager` logins; `next build`; a viewport and theme pass. The built-in browser pane was never logged in, so nothing was clicked by the assistant.
- The user should check one answer: the paragraph question of the test template saved as required (`is_required = true`), while the sample said not required. It is probably the default that was not unticked: the short answer question saved as `false`, so the checkbox works. If it was unticked and still saved as `true`, it is a bug.

## 3. Corrections to the earlier handoffs (read these first)

- `2026-11-24-behavioral-template-web.md` lists the review types as self, manager, peer, upward, others. Now: self, manager, peer, upward, **hr**, others (HR sits under Upward, Others is last). The migration replaces the CHECK, so a database that ran the first version accepts `hr` after it runs again.
- The same file says a multiple choice question has an options textarea, one per line. Now each answer option is its own input with an × button, and "+ Add answer option" under them, as in the legacy form. A new multiple choice question starts with two empty inputs: "Option 1" and "Option 2" are placeholders, not values. Blank or equal options (compared without case) are refused.
- The same file says slice c is open. It is done here. Its dead end about 404 is explained: the list linked to a route that did not exist.

## 4. Key decisions and rationale

- A published template has no action on the details page: the backend answers 409 for an edit of anything but a draft, and has no new-version route for behavioral templates (KPI has `POST :id/versions`).
- The edit of a draft sends the whole body, including the sections: the backend clears and rewrites the content of the draft version. Section, question, and option ids are not sent, so they are new on every save.
- The options have no sort column in `pms.behavioral_choice_options`, and the API reads them without an order. After an edit, the order of the options on screen can differ from the order typed. A sort column needs a schema change (hersvin).
- `GoalTemplateNotice` is shared and takes a `subject`, so the behavioral pages say "behavioral assessment templates" in the notice.

## 5. Dead ends (do not retry)

- A list row that links to a route with no page: it gave a 404. Build the page first, or do not link.
- `node -e "..."` with SQL or regular expressions inside double quotes: bash changes `\\n` and quotes. Write a file with the Write tool and run it.
- The insert script for the architecture trees misplaces a directory whose name has brackets (`[templateId]`): fix those lines by hand.

## 6. Files and changes (all uncommitted on `main`)

| File                                                                                                                                                                                                                    | Status                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `web/src/app/(workspace)/reviews/templates/behavioral-assessment-template/[templateId]/page.tsx`, `[templateId]/edit/page.tsx`                                                                                          | new                                                                                  |
| `web/src/features/review-templates/components/behavioral-template-details-view.tsx`, `behavioral-template-edit-form.tsx`                                                                                                | new                                                                                  |
| `web/src/features/review-templates/components/behavioral-template-editor.tsx`                                                                                                                                           | modes `create`, `edit`, and read only; one input per answer option; HR; placeholders |
| `web/src/features/review-templates/services/behavioral-template-editor-state.ts`, `manage-behavioral-template.ts`, `behavioral-template-state.ts`                                                                       | the tree to the builder text, the server actions, the helpers                        |
| `web/tests/` (unit, integration, component)                                                                                                                                                                             | 4 new files and updates                                                              |
| `packages/shared-types/src/domain/behavioral-review-type.enum.ts`, `packages/database/schema/behavioral-assessments.sql`, `migrations/2026-11-24-behavioral-template-details.sql`, `web/src/constants/domain-labels.ts` | `hr` in the review type                                                              |
| `docs/system-architecture.md`                                                                                                                                                                                           | trees and counts                                                                     |

## 7. Constraints and corrections

- Do not push to `main`. Do not create a branch, commit, or push until the user says so. Read `AGENTS.md`, `CLAUDE.md`, `backend/AGENTS.md`, and `web/AGENTS.md` first.
- Never edit an old handoff: write a new dated file. The user runs all SQL: write the script, never connect to the database.
- Write the failing test first. Call the advisor before the approach and before you say the work is done. Replies in Taglish and Caveman ultra, following `.claude/skills/writing-rules/SKILL.md`. No em dashes.

## 8. Open items and next steps

1. Browser pass in the user's own Chrome as admin001: open the details of the draft, Edit Draft and save, Publish Template (the row of the list becomes Published, `published_by` is the employee GUID), and the 403 notice for a `user` or `manager` login.
2. Backend routes that the web needs for the rest of the legacy flow: a new version of a published template, archive, and duplicate. Ask hersvin.
3. The question description of the legacy form has no column; the order of the options needs a sort column.
4. Gaps that stay: the list and the details return every company's templates (CWE-639, same as KPI), and an edit does not check that the template belongs to the caller's company.
5. Still open from `2026-11-24-kpi-text-and-pms-only.md`: the contract step (drop the old `company_id` and `position_id` columns and the old tables), and a browser check of the KPI flows.

## 9. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-24-behavioral-template-details-and-edit.md, docs/handoffs/2026-11-24-behavioral-template-web.md, and docs/handoffs/2026-11-24-kpi-text-and-pms-only.md first. We are on branch main in C:\Users\mdasalla\Documents\GitHub\performance-management-system with uncommitted changes. Do not create a branch, commit, or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: ask me what I saw in the browser pass (section 8, item 1), then fix what I report.
```
