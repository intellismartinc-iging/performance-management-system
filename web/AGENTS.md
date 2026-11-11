<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- sauron:start (managed by Sauron; edit outside this block) -->
<!--
  AGENTS.md: shared agent instructions standard (https://agents.md).
  Read by Codex, Cursor, GitHub Copilot, Windsurf, Cline, OpenCode, Kiro, Zed, CodeBuddy, Pi, and omp.
-->

# AGENTS.md

> Governed by Sauron v1.0.0. Shared instructions for every AGENTS.md-aware coding agent.

## Project Overview

Production codebase governed by Sauron Universal Agent Harness.

## Essential Commands

- Build: `npm run build`
- Test All: `npm test`
- Typecheck: `npx tsc --noEmit`

## Engineering Rules

- Present tense, active voice, English language exclusively.
- Zero emojis across all code files, comments, and commit messages.
- Prohibit Latin abbreviations: use 'for example', 'that is', 'and so forth'.
- Prohibit em dashes: use colons, parentheses, or separate sentences.
- Strict Red-Green-Refactor TDD required before touching production code.
- Zero untyped boundary parameters: enforce runtime validation (Zod, Pydantic).
- Zero hardcoded secrets, connection strings, or unredacted logging output.
- Token Conservation & Caveman Mode: active at tier 'ultra' from the first reply, no trigger needed. Preserve all code, commands, paths, and negations verbatim. Disable with '/caveman off'.

## Token Optimization & Caveman Mode

- Default: ACTIVE at tier `ultra` from the first reply of every session. No trigger command is needed.
- Tier `ultra`: Maximum compression: fragments, common abbreviations, arrows for cause and effect. One word when one word is enough.
- Never compress code blocks, diffs, commands, file paths, URLs, error messages, or quoted text. Copy them verbatim.
- Never drop negations (`not`, `never`, `no`). Compression must not flip meaning.
- Use normal prose for security warnings and confirmations of irreversible actions.
- Switch tiers on request: `/caveman lite`, `/caveman full`, `/caveman ultra`. Disable with `/caveman off`.

## Fellowship Sub-Agents

- **Elessar** (`/aragorn`): Principal System Architect
- **Shield of Gondor** (`/boromir`): Security Auditor and Shield
- **Ringbearer** (`/frodo`): Core Task Executor
- **Mithrandir** (`/gandalf`): Master Planner and Strategy Guide
- **Lockbearer** (`/gimli`): Refactorer and AST Dead Code Slasher
- **Greenleaf** (`/legolas`): Precision Linter and Syntax Bug Hunter
- **Brandir** (`/merry`): QA and TDD Specialist
- **Took** (`/pippin`): Edge Case and Chaos Prober
- **The Brave** (`/samwise`): Git Commits and State Keeper

## Anti-Pattern Guardrails

- AP-1 (Vague task verb) : Always decompose requests into concrete atomic tasks.
- AP-6 (Monolithic prompt) : Never combine architecture, code, and test in one step.
- AP-14 (Leaking secrets) : Zero credentials in version control.
- AP-17 (Skipping tests) : Code without a prior failing test is unverified code.
- AP-18 (Non-atomic commit) : One logical concern per commit.
- AP-52 (Fake fix) : Masking errors with type casts or empty catch blocks is prohibited.
- Full catalog: see `.agents/anti-patterns.md` before planning non-trivial work.

## Skills

- Shared Agent Skills live in `.agents/skills/<name>/SKILL.md`. See `.agents/skills/README.md`.
<!-- sauron:end -->

## Web

The root `AGENTS.md` applies here too, including the always-on lean code rule. This section replaces the npm commands in the Sauron block above, because the repository uses pnpm.

- Dev: `pnpm dev` (or `pnpm dev:web` from the root). Build: `pnpm build`. Lint: `pnpm lint`. Test: `pnpm test`. Typecheck: `pnpm typecheck` (runs `next typegen` first).
- Env: copy `.env.example` to `.env.local`. `PMS_API_BASE_URL` is the backend URL (`http://localhost:4000/`).
- Read `node_modules/next/dist/docs/` before you use a Next.js API. This app runs Next.js 16 with `cacheComponents` and `reactCompiler`.
- Import contracts from `@pms/shared-types`, and from no other workspace. Show a domain code as words through `src/constants/domain-labels.ts`.
- Auth: `src/features/auth` posts to the backend from a server action and sets the httpOnly cookie `pms-session`. `src/proxy.ts` redirects by that cookie. Never read the token in client code.
- A form turns its draft into a request body in the feature's `services/` folder (for example `template-requests.ts`) and checks it with the shared schema.

## Folder Rules

- Read [llm.txt](llm.txt) before you add or change a file in a folder. It holds the rules of every folder in `web/`, one section per folder.

## Design System

- Read [DESIGN.md](DESIGN.md) before you write or change any UI. It records the color, type, layout, surface, motion, and icon tokens, and the contrast proof.
- The token files are `src/styles/*.css` and `src/app/globals.css`. If `DESIGN.md` and the CSS differ, the CSS wins, and `DESIGN.md` is corrected.
- Never edit the designer palette in `src/styles/colors.css` (`--base-*`, `--status-*`, `--attendance-*`, `--calendar-*`) without the designer.
- Components read `--pms-*` roles or the shadcn roles. No hard-coded colors, sizes, radii, shadows, or durations: add a token first.
- Write `text-(color:--token)` for a text color from a variable, because `text-(--token)` can be read as a font size.
- Show status and errors with a word or icon as well as color. Keep text at 4.5 to 1 contrast and controls at 3 to 1 in both themes.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
