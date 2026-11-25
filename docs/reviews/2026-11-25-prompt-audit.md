# Prompt audit: AGENTS.md, CLAUDE.md, and the test-driven-development skill

2026-11-25 · Read-only audit. No file was changed. The proposed diff at the end is for the user to accept hunk by hunk.

## Assumptions (Step 0)

- **Scope:** `AGENTS.md`, `CLAUDE.md`, and the two copies of `test-driven-development/SKILL.md` (`.claude/skills/` and `.agents/skills/`), because the request names them. Left out: `backend/AGENTS.md`, `backend/CLAUDE.md`, `web/AGENTS.md`, `web/CLAUDE.md`, `web/llm.txt`, and every other skill.
- **Target model:** the model that runs this session (Claude Sonnet 5.5). `AGENTS.md` is also read by other coding agents, so the added text stays agent-neutral.
- **Inventory:** 2 tracked instruction files (`AGENTS.md` 131 lines, `CLAUDE.md` 11 lines, which imports `AGENTS.md`), 2 untracked skill files (133 and 134 lines).

## Answer to the request: can the TDD skill be included?

Yes, with one fact that decides the design: `.claude/` and `.agents/` are in `.gitignore` (`git ls-files .claude .agents` prints nothing). The skill exists only on this machine. hersvin and any other agent never see it. `AGENTS.md` already says "Apply the rules in these tracked instructions even when a skill is missing from the local install", so the tracked file must carry the TDD rules itself, and the skill is the deeper layer for whoever has it installed. This is the same shape as the existing "Lean code (always on)" section. `CLAUDE.md` gets no copy: it imports `AGENTS.md`.

Whether to track `.claude/skills/test-driven-development/` in git is the user's policy call. This audit does not propose it.

## Summary

Six findings: one `add` (the request), one `flag`, three `rewrite` or `remove` in the skill, one `remove` in `CLAUDE.md`. Group 1: 1 finding. Group 2: 5 (finding 1 counts here too). Groups 3 and 4: not applicable (no tool descriptions, no request code in scope). Everything else in the two files is current: the rules agree between `AGENTS.md` and `CLAUDE.md`, and every project path they name exists (`web/llm.txt`, `web/DESIGN.md`, `docs/workspace-blueprint.md`, `web/src/constants/domain-labels.ts`, `web/src/proxy.ts`, `.github/CODEOWNERS`, `packages/shared-types/src/rows`).

## Findings

| #   | Location                                                                      | Evidence                                                                                                                                   | Pattern                                       | Why                                                                                                                                                                                                                                                                                                                            | Confidence                             | Action                                |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------- |
| 1   | `AGENTS.md:42`                                                                | "Write the failing test first (Red, Green, Refactor)."                                                                                     | Keep-list 11 (add), Group 2                   | One line holds the whole TDD rule. It omits the part that makes a test count: seeing it fail for the expected reason, the minimum code, and the revert-and-reapply step for a fix that is already written. The skill that holds these is untracked                                                                             | Medium                                 | `add` a section, point line 42 at it  |
| 2   | `AGENTS.md:117`                                                               | "Edit only the files the user names."                                                                                                      | Group 2, contradiction inside one file        | Read literally, it blocks the new test file that rule 1 requires, and the handoff file and README row that the Handoff section requires. Fixing it loosens a scope rule, so it is not edited                                                                                                                                   | High (it contradicts lines 42 and 129) | `flag`, wording below                 |
| 3   | `.claude/skills/test-driven-development/SKILL.md:45` (and `.agents/...:45`)   | "Code changes already completed without tests: NO, Halt and add failing test retrospective."                                               | Group 2, contradiction inside one file        | The description (line 3) and section 6.1 say the opposite: a fix that is already written needs the test seen red first (remove the fix, watch it fail, reapply). The row describes the excuse that section 6.1 rejects                                                                                                         | High                                   | `rewrite`                             |
| 4   | `.claude/skills/test-driven-development/SKILL.md:117` (`.agents/...:117-118`) | A stray `s` on its own line, before the Portability heading                                                                                | Group 2, corruption                           | An editing slip. It reads as text in the file                                                                                                                                                                                                                                                                                  | High                                   | `remove` in both copies               |
| 5   | `.claude/skills/test-driven-development/SKILL.md:65` (and `.agents/...:65`)   | "`rules/engineering/defensive-programming.md`, `rules/common/code-style-standards.md`, and `rules/engineering/architecture-boundaries.md`" | Group 2, volatile specifics                   | None of these paths exists in this repository (`rules/engineering/architecture-boundaries.md`, `core/fellowship/frodo.md`, `references/anti-patterns.md` all missing). The model cannot follow them from this project                                                                                                          | High                                   | `rewrite` to the `AGENTS.md` sections |
| 6   | `CLAUDE.md:11`                                                                | "Use adaptive thinking natively. Add no step-by-step scaffolding."                                                                         | Group 1b, thinking prose; Group 2, unenforced | Prose about thinking does nothing in an agent configuration file: the agent's own settings control it. "No step-by-step scaffolding" also reads as a conflict with the three-step Red, Green, Refactor workflow of finding 1. `git blame`: commit `8f258cc`, 2026-11-11, the initial file, with no incident or reason attached | Medium                                 | `remove`                              |

**Flag only, low confidence, outside the diff:** in the skill file, the `Normative base` line (line 21) and the three different anti-pattern lists (frontmatter AP-1, AP-6, AP-18; section 0 AP-1, AP-4, AP-9, AP-26, AP-28, AP-44, AP-45; section 7 AP-9, AP-6, AP-4) are metadata from the skill library they came from. The Portability matrix marks every runtime "verified", with no evidence in this repository. They do not change the model's behavior, so an audit leaves them.

**Left alone on purpose:** the em dashes in `web/AGENTS.md` (a block that `next dev` writes and restores). The style prohibitions in `AGENTS.md` (no emojis, no em dashes, no Latin abbreviations): they are the team's stated policy. The advisor and handoff rules that appear in both `AGENTS.md` and `CLAUDE.md`: the copies agree, which keep-list item 8 protects.

**Flag, a third copy (checked):** `C:\Users\Admin\.claude\skills\test-driven-development\SKILL.md` exists. This session lists the skill by the unscoped name only, so this user-level copy is the one that loads when `AGENTS.md` says "Load the `test-driven-development` skill". It has the same text (only the table padding differs), the same trigger-row contradiction (line 45), the same missing paths (line 65), and no stray `s`. A fix to the two repository copies does not reach it, and an edit there affects every project on this machine, so this audit proposes no hunk for it. Findings 3 and 5 stay open for that copy until the user decides.

**Not assessed:** whether removing `CLAUDE.md:11` changes behavior: no probe was run (Step 7).

## Proposed diff

One hunk per finding. Hunks 1, 2, and 6 are for the tracked files. Hunks 3 to 5 touch untracked local files, so they affect only this machine.

### Hunk 1: `AGENTS.md`, add a section after "Lean code (always on)", and shorten line 42

Add this section before `## Security`:

```markdown
## Test-driven development (always on)

Apply to every change to production code: a feature, a bug fix, or a refactor. Documentation-only changes are excluded.

1. Write the failing test first. Run it and confirm that it fails for the expected reason, not for a typo or a missing import. A test that passes at once proves nothing: fix the test.
2. Write the minimum production code that makes the test pass. Add nothing the test does not require.
3. Refactor with the full suite green. Run the affected suite after each edit.
4. For a fix that is already written, revert the fix, watch the new test fail for the reported reason, then reapply the fix. A test that has only ever passed is unproven.
5. Report the red run and the green run in the closing message, each with its command and result.
6. Load the `test-driven-development` skill when available.
```

Change line 42:

```diff
-- Write the failing test first (Red, Green, Refactor).
+- Follow the Test-driven development rules above: the failing test comes first.
```

### Hunk 2: `AGENTS.md:117`, flagged, suggested wording for the user to decide

```diff
-- Edit only the files the user names. `backend/` belongs to the backend developer: change only what the task names.
+- Edit the files the user names, the tests for them, and the handoff that this file requires. `backend/` belongs to the backend developer: change only what the task names.
```

### Hunk 3: skill trigger row, both copies

```diff
-| Code changes already completed without tests | NO    | Halt and add failing test retrospective. |
+| Code changes already completed without tests | YES   | Revert the change, write the failing test, watch it fail, then reapply the change. |
```

### Hunk 4: stray line, both copies

Replace the stray line with a blank line, so a blank line stays before the `## 9. Portability Matrix` heading:

```diff
-s
+
```

(In the `.agents` copy the lines are `    s` and a blank line: replace the pair with one blank line.)

### Hunk 5: skill Step 3, both copies

```diff
-- **Action:** Refactor production and test code to adhere to `rules/engineering/defensive-programming.md`, `rules/common/code-style-standards.md`, and `rules/engineering/architecture-boundaries.md`.
+- **Action:** Refactor production and test code to follow the rules in `AGENTS.md`: "TypeScript, functions, errors", "Architecture", and "Naming".
```

### Hunk 6: `CLAUDE.md`

```diff
-- Use adaptive thinking natively. Add no step-by-step scaffolding.
```

## Order of work, if accepted

1. Hunk 1, then hunk 6 (the two tracked edits). Run `pnpm exec prettier --check AGENTS.md CLAUDE.md`: the pre-commit hook runs Prettier on root Markdown.
2. Hunks 3 to 5 (local skill files, no commit).
3. Hunk 2 only if the user agrees with the wording.
4. Per the handoff rule, a changed instruction file needs a new dated handoff only when a module or feature is complete: this change needs none.
