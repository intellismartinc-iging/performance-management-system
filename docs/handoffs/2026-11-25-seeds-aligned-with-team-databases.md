# Handoff: the user and employee seeds follow the team databases

2026-11-25 · `packages/database/seeds/employees.sql` and `users.sql` now carry the real accounts of the developers' `pms` databases, so every database shares the same ids, GUIDs, usernames, emails, and roles. Boss hersvin asked for all the accounts in the seeder, and nothing comes from `public.employees` any more (the team moved to the `pms` schema). Nothing is committed or pushed. Branch `feat/kpi-text-and-behavioral-templates` (PR #9, not merged). This file edits no older handoff.

Recipient: the next AI session in this repo. The user in a session may be Miguel or boss hersvin. Replies are Taglish.

## 1. What changed

- `seeds/employees.sql`: employees 21 to 27.
  - 21 is Iging DotTech (`ITI-001`, GUID `284ddc9e-ebe4-468d-945f-fb18af72e622`, HRDotNet id 1, Software Engineer). It replaces the placeholder Juan Dela Cruz.
  - 22 (Maria Santos) and 23 (Ramon Reyes) stay as fixtures without a login.
  - 24 Lebron James (`SIXERS-023`), 25 System Administrator (`admin`), 26 Iging ManagerDotTech (`ITI-002`), and 27 Iging UserDotTech (`ITI-003`) are new.
  - `division` and every personal-detail column are `NULL`, as the team database holds them.
- `seeds/users.sql`: five logins with the database ids: 1 `admin` (ADMIN, employee 25), 4 `admin001` (ADMIN, 21), 8 `manager` (MANAGER, 26), 9 `user` (USER, 27), 10 `lebronjames023` (ADMIN, 24). The old fixture logins `jdelacruz`, `msantos`, and `rreyes` are gone. All five use the development hash for `Seed-Pass-2026`. No real password hash is in the repo.
- The other seeds: all 19 references to the old placeholder GUID `…0021` (nine files) now point at the real GUID of employee 21.
- Test first: `packages/database/schema.test.mjs`, "the seeds carry the real accounts of the team databases". It failed before the seeds changed. The older test no longer expects the `…0021` fixture.
- Verified on 2026-11-25 (commands run): `@pms/database` 14 tests pass, `@pms/shared-types` 90 tests pass.

## 2. Not verified (read this before relying on the seeds)

- The values were read from screenshots of the user's own database, not copied as text. The GUIDs of employees 24, 25, and 27, and the manager email, were typed from a screenshot. Run the three read-only checks in section 5: query 7 must show `found = true` on all seven rows.
- The columns after `employment_status` were cut off in the screenshots. The seeds assume `NULL` for `middle_name`, `suffix`, `mobile_number`, `gender`, `birth_date`, `place_of_birth`, `marital_status`, `nationality`, `religion`, `blood_type`, and `photo_url`, because `division` was `NULL` in the database for every row, which points to columns added after the rows were made. Query 8 must return no rows.
- The `employment_status` of employees 22 and 23 was cut off. The seeds keep the old fixture values (`regular` and `probationary`). Query 9 confirms them.
- `hrdotnet_id` is a plain data column: employees 22 and 26 both hold 2, and 23 and 27 both hold 3. The backend does not map an account to its employee by it (it uses `users.employee_id`), so this does no harm. It was copied as it is.
- The seed was not loaded into a real database in this session (the user runs all SQL).

## 3. Decisions

- Copy the databases, do not invent: the user and boss hersvin want the seeds to match, not fictional fixtures. The existing real emails and names are in a tracked file by their decision.
- One development hash for every seeded login, because the real password hashes belong to the databases that hold them.
- `ON CONFLICT (id) DO NOTHING` stays. It means a seed never changes a row that a database already holds.

## 4. What boss hersvin does in his database (a seed does not align an existing database)

`ON CONFLICT (id) DO NOTHING` skips every id that his `pms.users` and `pms.employees` already hold. If his id 1 is not `admin`, the seed keeps his row without a word. So:

1. Pull this branch after PR #9 merges.
2. Run the two migrations of 2026-11-24 in `packages/database/migrations/`: `2026-11-24-kpi-company-position-text.sql`, then `2026-11-24-behavioral-template-details.sql`.
3. Run the read-only check of section 5 and compare it with `seeds/users.sql` and `seeds/employees.sql`.
4. If a row differs, decide how to align it. `pnpm --filter @pms/database db:init` does not align an existing database: `packages/database/init-db.mjs` creates the database only if it is missing, applies `schema.sql` (`CREATE ... IF NOT EXISTS`), and runs the seeds (`ON CONFLICT (id) DO NOTHING`), so it is safe to repeat and it changes no row that exists. The two ways are:
   - Change the differing rows by hand (an `UPDATE` that he reviews).
   - Drop the `pms` schema (or the database) and run `db:init` again. The drop destroys all the data of that schema, so it is his call, and nothing in this repo runs it for him. Back the data up first if it matters.
5. Do not write a script that rewrites GUID references in live tables unless he asks for one.

## 5. Read-only checks (write them out here, because `.codex/` is gitignored)

Run them in pgAdmin, one at a time. Every query reads `pms` only.

```sql
-- Query 7: every seed row matches the database. Expected: found = true on all 7 rows.
SELECT v.id, (e.id IS NOT NULL) AS found
FROM (VALUES
  (21, '284ddc9e-ebe4-468d-945f-fb18af72e622', 'ITI-001', 'iging@hrdotnet.com'),
  (22, '00000000-0000-0000-0000-000000000022', 'EMP-002', 'employee2@example.invalid'),
  (23, '00000000-0000-0000-0000-000000000023', 'EMP-003', 'employee3@example.invalid'),
  (24, '6a685ca5-7613-4e80-a384-4ebe60263aa3', 'SIXERS-023', 'lebronjames@gmail.com'),
  (25, '6293e9c7-6495-4555-85a9-1eccebc6d34c', 'admin', 'admin@pms.local'),
  (26, 'ce58dfdf-e0bf-47d8-9060-3dc10d732d07', 'ITI-002', 'iging@managerdotnet.com'),
  (27, '08bd7bb2-faa4-46ae-b7c1-cc20664d7331', 'ITI-003', 'iging@userdotnet.com')
) AS v(id, guid, code, email)
LEFT JOIN pms.employees e ON e.id = v.id AND e.guid::text = v.guid AND e.code = v.code AND e.email = v.email
ORDER BY v.id;

-- Query 8: employees with a value in the columns that the seed leaves empty. Expected: no rows.
SELECT id, division, middle_name, suffix, mobile_number, gender, birth_date, place_of_birth,
       marital_status, nationality, religion, blood_type, photo_url
FROM pms.employees
WHERE num_nonnulls(division, middle_name, suffix, mobile_number, gender, birth_date, place_of_birth,
                   marital_status, nationality, religion, blood_type, photo_url) > 0
ORDER BY id;

-- Query 9: the status of the two fixtures. Expected: 22 regular, 23 probationary.
SELECT id, employment_status, status FROM pms.employees WHERE id IN (22, 23) ORDER BY id;

-- The logins: expected ids 1, 4, 8, 9, 10 with the roles and employees of seeds/users.sql.
SELECT u.id, u.username, u.email, r.code AS role, u.employee_id
FROM pms.users u JOIN pms.user_role r ON r.id = u.user_role_id
ORDER BY u.id;
```

## 6. Open items

1. The user runs queries 7, 8, and 9 and reports the result. If a value differs, correct the seed and the test, test first.
2. Boss hersvin compares his database with the seeds (section 4).
3. The other open items stay in `2026-11-25-behavioral-browser-pass-2.md` and `2026-11-25-kpi-publish-confirmation.md`.

## 7. Constraints

- Do not push to `main`. Do not commit or push until the user says so. Never edit an old handoff. The user runs all SQL. Use `pms` only, never `public`. Write the failing test first.

## 8. Suggested opening prompt for boss hersvin's session

```text
/lean-code activate
/caveman ultra activate

Address me as boss hersvin in chat.

Read AGENTS.md, CLAUDE.md, backend/AGENTS.md, web/AGENTS.md, and docs/handoffs/2026-11-25-seeds-aligned-with-team-databases.md first. We are in C:\Users\mdasalla\Documents\GitHub\performance-management-system (or my own clone of it), on the branch of PR #9 or on main after it merges. Do not push to main. Do not commit or push until I say so. Never edit an old handoff: write a new dated file. Never run SQL on my database: write the script and I run it. Use the pms schema only.

Rules: replies in Taglish and Caveman ultra, following .claude/skills/writing-rules/SKILL.md. Write the failing test first. Call the advisor before the approach and before you say the work is done.

First task: follow section 4 of the handoff with me. Write the read-only checks of section 5 for my database, wait for my results, and list every row where my database differs from packages/database/seeds/users.sql and employees.sql. Do not rebuild or change my database.
```
