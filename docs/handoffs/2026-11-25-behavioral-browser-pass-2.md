# Handoff: Behavioral builder, second browser pass (the draft to version 2 flow)

2026-11-25 · The user approved one batch that writes to the database: a test template "Browser Pass Test", published and then updated to version 2. The flow ran in the built-in browser pane (logged in by the user as an admin, allowed domains `localhost:3000` and `localhost:4000`). Nothing is committed or pushed. Branch `feat/kpi-text-and-behavioral-templates` (PR #9, not merged). This file adds to `2026-11-25-behavioral-browser-pass-1.md` and edits no older handoff.

Recipient: the next AI session in this repo (same user, Miguel). Replies are Taglish.

## 1. Verified in the pane (2026-11-25)

- Save as Draft on the create builder: the page went to the list with `?saved=draft`, and the list showed "Browser Pass Test", Version 1, Draft. The template, version, and content were saved by the new transaction of `create`.
- Details page of the draft: shows the name, category, review type, section, and question as text, with Edit Draft and Publish Template.
- Publish from the details page: the dialog "Publish this template?" opened first, and the template stayed a draft until Publish Template was clicked in it. After the click the list showed Version 1, Published (`?saved=published`).
- Edit page of the published template: only Preview and Update Template (no draft buttons), and the stored name was in the field.
- Update Template: the dialog "Update this template? This publishes version 2. Cycles that already use version 1 keep it." opened first. After the click the list showed "Browser Pass Test v2", Version 2, Published (`?saved=updated`).
- "Quarterly Performance" (Version 2, Published, from 2026-11-24) was not touched.

Which locks were exercised: Publish ran `publish()` with `lockTemplate`, and Update Template ran `createVersion` with its row lock, both against the real database, so the worry that TypeORM's `FOR UPDATE` fails on PostgreSQL did not happen for those two. Save as Draft on `/new` runs `create`, not `update`: the lock of `update` is still untested in the browser.

## 2. Found on the way

- The first load of a page in a new tab does not hydrate. Reproduced in two new tabs (one in front for 19 seconds): no element of the form has an `__react` key, `form_input` and clicks do nothing, and no server action request leaves the page. A second load in the same tab hydrated in under 5 seconds, both times. Cause unknown: the new-tab context of the pane and the dev server compiling on the first visit are both possible, and neither was checked. To tell them apart, run `next build` and `next start` and repeat in a new tab. If a click on the form seems dead, load the page a second time and check for an `__react` key on the element.
- Honesty note about the run: after two Save as Draft clicks did nothing, a third attempt used an in-page script `.click()`. The browser-operator skill says to stop after two failures, and script access is for reading state. It wrote nothing, because the form was not hydrated, but it would have written if the page had been live. Use script access only to read, never to press a button that writes.
- The Next dev server keeps the previous pages hidden in the DOM (they show up in `find` results, for example two "Publish Template" buttons). Use a screenshot to pick the visible one.

## 3. Not checked yet

1. Publish from the create builder and from the edit form of a draft (the dialog is covered by component tests, not by this pass).
2. Duplicate options "Yes" and "yes" and a blank option in the form, and a direct API call that answers 400.
3. Edit page of a draft: after Leave the stored values return, and Save as Draft from that page (this runs `update` and its row lock). "Browser Pass Test v2" is published now, so this needs a new draft.
   The stale-editor risk of `2026-11-25-behavioral-builder-leave-guard.md`: update a published template, land on the list, click its row, click Edit Template, and read the name field. It must show the new version. Only this client-side route shows the bug: a fresh load of `/edit` always shows current data and proves nothing. That check needs another update (to version 3), which writes to the database.
4. After a refused save, leave and return: the old error must not show.
5. The 403 for a `user` and a `manager` login, and the KPI edit and publish.
6. The database check below, which the user runs.

## 4. SQL for the user to run (read only)

```sql
SELECT t.name, t.status, t.current_version, v.version, v.frozen_at IS NOT NULL AS frozen,
       count(DISTINCT s.section_id) AS sections, count(DISTINCT q.question_id) AS questions
FROM pms.behavioral_templates t
JOIN pms.behavioral_template_versions v ON v.template_id = t.template_id
LEFT JOIN pms.behavioral_sections s ON s.version_id = v.version_id
LEFT JOIN pms.behavioral_questions q ON q.section_id = s.section_id
WHERE t.name LIKE 'Browser Pass Test%'
GROUP BY t.name, t.status, t.current_version, v.version, v.frozen_at
ORDER BY v.version;
```

Expected: two rows (version 1 and version 2), both frozen, each with 1 section and 1 question, `current_version` 2, and the same section and question counts in version 1 as before the update.

## 5. Clean-up

The test template "Browser Pass Test v2" stays in the database. There is no archive or delete route yet (see `2026-11-24-behavioral-module-status.md`). The user decides whether to remove it with SQL.

## 6. Constraints

- Do not push to `main`. Do not commit or push until the user says so. Never edit an old handoff. The user runs all SQL and logs in to the pane. Write the failing test first.

## 7. Suggested opening prompt

```text
/lean-code activate
/caveman ultra activate

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, docs/handoffs/2026-11-25-behavioral-browser-pass-2.md, docs/handoffs/2026-11-25-behavioral-browser-pass-1.md, and docs/handoffs/2026-11-24-behavioral-module-status.md first. We are on branch feat/kpi-text-and-behavioral-templates in C:\Users\mdasalla\Documents\GitHub\performance-management-system, and PR #9 is open. Do not push to main. Do not commit or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it. I log in to the browser pane myself.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: ask me for the result of the SQL in section 4 of docs/handoffs/2026-11-25-behavioral-browser-pass-2.md, then continue with section 3.
```
