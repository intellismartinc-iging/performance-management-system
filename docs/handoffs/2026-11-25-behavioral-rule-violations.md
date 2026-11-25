# Handoff: Behavioral Assessment templates, the three rule violations fixed

2026-11-25 · The three small violations of `2026-11-24-behavioral-module-status.md` (section 3, row "PRD violated by existing code", and section 4, item 1) are fixed on branch `feat/kpi-text-and-behavioral-templates`, the branch of PR #9 (not merged). Nothing is committed or pushed.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Objective

Close the three rule violations of the status handoff, each with a failing test first, and add the publish confirmation in the web. Archive, company scoping, list counts, audit events, and the option sort column stay open.

## 2. Current state

- Backend (`backend/src/modules/behavioral-assessment/`):
  - `assertValidOptions` runs before any write in `create`, `update`, and `createVersion`. A multiple choice question needs two or more options, none blank, none twice. Labels compare trimmed and without case (the database `UNIQUE (question_id, label)` compares exact text only). The old check inside `saveQuestions` is gone: it fired after the template and the version were saved.
  - `create`, `update`, and `publish` each run in one transaction (`inTransaction`, the stores come from `manager.getRepository`). `update` and `publish` lock the template row (`pessimistic_write`). `createVersion` uses the same `storesOf` helper.
  - `publish()` reads the sections and questions of the draft version inside the transaction, and answers 400 for a draft with no section or a section with no question. A draft can still be saved empty: only a frozen version needs content.
  - `saveQuestions` saves options only for a `multiple_choice` question, as the shared schema does. Before, a `rating_scale` question that carried options saved them, and the database `UNIQUE` could answer a 500.
  - `ChoiceOptionDto.label` has `@Matches(/\S/)`: a blank label is refused at the DTO.
  - `findActiveDraftVersion` no longer swallows errors (`.catch(() => null)` removed) and answers 404 when no draft version exists.
- Web (`web/src/features/review-templates/`): Publish asks first, in three places: the create form, the edit form of a draft, and the details view. The words live in `PUBLISH_CONFIRMATION` (`services/behavioral-template-state.ts`). The create and edit forms check the template first, so a dialog never opens for a template the API would refuse.
- Verified on 2026-11-25 (commands run): backend 16 files and 198 tests pass, `tsc --noEmit` and `pnpm --filter @pms/backend lint` print nothing. Web 31 files and 279 tests pass. Root `pnpm lint` and `pnpm typecheck` print no error.
- Not verified: rollback. The tests use mocks, so they prove that the writes go through one transaction, not that PostgreSQL rolls back. No integration test exists. Also not verified: the browser pass of `2026-11-24-behavioral-module-status.md`, `next build`, a viewport and theme pass of the new dialogs.

## 3. Decisions and reasons

- Validate before the transaction opens: a bad option stops the request before a lock is taken or a row is touched. `update` deleted the old content first and failed after: that order is now impossible.
- Drafts may be empty (the PRD blocks only the invalid publication, Tpl-B-003). The content check is in `publish` and `createVersion`.
- Repositories from `manager.getRepository`, not `manager.save(Entity, ...)`, so the same save code runs with or without a transaction.
- Publish confirmation copy: "A published template is frozen. To change it later, you publish a new version."

## 4. Dead ends and fixture changes (not weakened tests)

- The spec "freezes the active version and publishes the draft" relied on `sections.find` returning an empty list. The content check made it fail, so the fixture now holds one section and one question. Two new tests cover a draft with no section and a draft with a section with no question.
- The web test "publishes with the publish intent" (edit and create form) now clicks the confirm button of the dialog first.
- Shell hazard stays: write a file with a regex through the Write or Edit tool and grep it. `@Matches(/\S/)` was grepped after the edit.

## 5. Files and changes (uncommitted on the PR branch)

| File                                                                                                            | Status                                                       |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `backend/.../services/behavioral-assessment.service.ts` and its spec                                            | validator, transactions, publish content check, 11 new tests |
| `backend/.../dtos/behavioral-section.dto.ts` and `behavioral-template-contract.spec.ts`                         | `@Matches(/\S/)` on the option label, 2 tests                |
| `web/.../services/behavioral-template-state.ts`                                                                 | `PUBLISH_CONFIRMATION`                                       |
| `web/.../components/behavioral-template-create-form.tsx`, `-edit-form.tsx`, `-details-view.tsx`                 | the confirmation                                             |
| `web/tests/component/behavioral-template-create-form.test.tsx`, `-edit-form.test.tsx`, `-details-view.test.tsx` | tests for the confirmation                                   |
| `docs/handoffs/README.md`                                                                                       | row for this file                                            |

## 6. Constraints and corrections

- The branch is `feat/kpi-text-and-behavioral-templates`. Do not push to `main`. Commit and push only when the user says so. Never edit an old handoff: write a new dated file. The user runs all SQL.
- Corrections to `2026-11-24-behavioral-module-status.md`: its section 3 row "PRD violated by existing code" and its section 4 item 1 are done (see section 2 above). The statement that the 500 for a duplicate option was "unverified" no longer matters: the API answers 400 first. Section 3 of that file, Not done rows, still hold.
- `backend/` belongs to hersvin: list these changes for his review (transactions, the validator, the publish content check).

## 7. Open items

1. Browser pass with the user: save a draft (this takes the new row lock of `update`, which no test ran against PostgreSQL; the entity has no eager relation, so the query is a plain `SELECT ... FOR UPDATE`, unverified), publish from the three places (dialog first), duplicate options "Yes" and "yes" (400 with a message), publish an empty draft (400), edit a published template (version 2, version 1 rows kept), 403 for `user` and `manager`, KPI edit and publish.
2. Needs hersvin: archive, company scoping of list, details, and writes (CWE-639), audit events, a sort column for options.
3. Not in the PRD: list counts, search, filters, pagination, duplicate.
4. An integration test of the rollback against a real database.

## 8. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-25-behavioral-rule-violations.md, and docs/handoffs/2026-11-24-behavioral-module-status.md first. We are on branch feat/kpi-text-and-behavioral-templates in C:\Users\mdasalla\Documents\GitHub\performance-management-system, and PR #9 is open. Do not push to main. Do not commit or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: ask me what I saw in the browser pass (section 7, item 1), then fix what I report.
```
