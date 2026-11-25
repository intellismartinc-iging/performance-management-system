# Handoff: the seed checks ran, and one seed value was corrected

2026-11-25 · The user ran queries 7, 8, and 9 of `2026-11-25-seeds-aligned-with-team-databases.md` section 5 on their own `pms` database. The seeds match it now. Nothing is committed or pushed. Branch `feat/kpi-text-and-behavioral-templates` (PR #9, not merged). This file edits no older handoff.

Recipient: the next AI session in this repo. The user in a session may be Miguel or boss hersvin. Replies are Taglish.

## 1. Results (read from screenshots of the user's database, 2026-11-25)

- Query 7: `found = true` on all seven employees (ids 21 to 27). The GUIDs, codes, and emails of the seeds equal the database, including the GUIDs of employees 24, 25, and 27 and the manager email that were read from a screenshot before.
- Query 8: no row. No employee holds a value in `division` or the personal-detail columns, as the seeds assume.
- Query 9: employee 22 is `regular` and employee 23 is `regular`. The seed said `probationary` for employee 23.

## 2. What changed

- `seeds/employees.sql`: employee 23 (Ramon Reyes) is `regular`. Test first: the test "the seeds carry the real accounts of the team databases" in `packages/database/schema.test.mjs` now asserts it and that no seed holds `probationary`. It failed (13 pass, 1 fail), then passed.
- Verified on 2026-11-25 (commands run): `@pms/database` 14 tests pass, `@pms/shared-types` 90 tests pass.

## 3. Corrections to `2026-11-25-seeds-aligned-with-team-databases.md`

- Section 2, "Not verified": the GUIDs, the tail columns, and the status of employee 22 are verified now for the database of the user (Miguel). The status of employee 23 was wrong in the seed and is fixed.
- It is still unverified for boss hersvin's database. Section 4 of that file stays the way to check it.

## 4. Open items

1. Boss hersvin runs the checks of section 5 of `2026-11-25-seeds-aligned-with-team-databases.md` on his database and compares.
2. The logins (ids 1, 4, 8, 9, 10) were read from a screenshot of query 1 and query 6 and were not compared by a query. The last query of section 5 of that file lists them for a comparison.
3. The other open items stay in `2026-11-25-behavioral-browser-pass-2.md` and `2026-11-25-kpi-publish-confirmation.md`.

## 5. Constraints

- Do not push to `main`. Do not commit or push until the user says so. Never edit an old handoff. The user runs all SQL. Use `pms` only, never `public`. Write the failing test first.
