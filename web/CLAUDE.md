<!-- sauron:start (managed by Sauron; edit outside this block) -->

# CLAUDE.md

> Managed by Sauron v1.0.0. Persistent instruction manual for Claude Code.

## Where Things Live

- Skills: `.claude/skills/` (invoke with `/<skill-name>`). Shared copy for other tools: `.agents/skills/`.
- Subagents: `.claude/agents/` (invoke with `@<agent-id>` or let Claude delegate).
- Slash commands: `.claude/commands/`.
- Anti-patterns reference: `.agents/anti-patterns.md`.
- Add your own project notes (build commands, architecture) outside the Sauron block in this file.

## Code Style & Conventions

- Present tense, active voice, English language exclusively.
- Zero emojis across all code files, comments, and commit messages.
- Prohibit Latin abbreviations: use 'for example', 'that is', 'and so forth'.
- Prohibit em dashes: use colons, parentheses, or separate sentences.
- Strict Red-Green-Refactor TDD required before touching production code.
- Zero untyped boundary parameters: enforce runtime validation (Zod, Pydantic).
- Zero hardcoded secrets, connection strings, or unredacted logging output.
- Token Conservation & Caveman Mode: active at tier 'ultra' from the first reply, no trigger needed. Preserve all code, commands, paths, and negations verbatim. Disable with '/caveman off'.

## Fellowship Sub-Agents

- Not installed in this project. Add them with `npx sauron-ai init --agents=fellowship`.
- Specialist subagents are installed in `.claude/agents/`. Invoke one with `@<agent-id>`.

## Token Optimization & Caveman Mode

- Default: ACTIVE at tier `ultra` from the first reply of every session. No trigger command is needed.
- Tier `ultra`: Maximum compression: fragments, common abbreviations, arrows for cause and effect. One word when one word is enough.
- Never compress code blocks, diffs, commands, file paths, URLs, error messages, or quoted text. Copy them verbatim.
- Never drop negations (`not`, `never`, `no`). Compression must not flip meaning.
- Use normal prose for security warnings and confirmations of irreversible actions.
- Switch tiers on request: `/caveman lite`, `/caveman full`, `/caveman ultra`. Disable with `/caveman off`.
<!-- sauron:end -->

## Web

The root `AGENTS.md` and `CLAUDE.md` apply here too, including the always-on lean code rule. This section replaces the npm commands in the Sauron block above, because the repository uses pnpm.

- Dev: `pnpm dev` (or `pnpm dev:web` from the root). Build: `pnpm build`. Lint: `pnpm lint`. Test: `pnpm test`. Typecheck: `pnpm typecheck` (runs `next typegen` first).
- Env: copy `.env.example` to `.env.local`. `PMS_API_BASE_URL` is the backend URL (`http://localhost:4000/`).
- Read `node_modules/next/dist/docs/` before you use a Next.js API. This app runs Next.js 16 with `cacheComponents` and `reactCompiler`.
- Import contracts from `@pms/shared-types`, and from no other workspace. Show a domain code as words through `src/constants/domain-labels.ts`.
- Auth: `src/features/auth` posts to the backend from a server action and sets the httpOnly cookie `pms-session`. `src/proxy.ts` redirects by that cookie. Never read the token in client code.

## Folder Rules

- Read [llm.txt](llm.txt) before you add or change a file in a folder. It holds the rules of every folder in `web/`, one section per folder.

## Design System

- Read [DESIGN.md](DESIGN.md) before you write or change any UI. It records the color, type, layout, surface, motion, and icon tokens, and the contrast proof.
- The token files are `src/styles/*.css` and `src/app/globals.css`. If `DESIGN.md` and the CSS differ, the CSS wins, and `DESIGN.md` is corrected.
- Never edit the designer palette in `src/styles/colors.css` (`--base-*`, `--status-*`, `--attendance-*`, `--calendar-*`) without the designer.
- Components read `--pms-*` roles or the shadcn roles. No hard-coded colors, sizes, radii, shadows, or durations: add a token first.
- Write `text-(color:--token)` for a text color from a variable, because `text-(--token)` can be read as a font size.
- Show status and errors with a word or icon as well as color. Keep text at 4.5 to 1 contrast and controls at 3 to 1 in both themes.
