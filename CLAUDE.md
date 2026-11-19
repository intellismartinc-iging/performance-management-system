@AGENTS.md

## Claude Code

- Follow the imported lean-code, security, and package rules. Use the named skills when available and follow the written checks on every checkout.
- Outline the blast radius before a change that touches more than one workspace (`web`, `backend`, `packages/*`).
- Ask before a destructive command: `git reset --hard`, `git push --force`, `rm -rf`, dropping a table.
- Read the `AGENTS.md` and `CLAUDE.md` inside `web/` or `backend/` when you work in that folder.
- Call the `advisor` tool before you commit to an approach on a complex task: a change across workspaces, an access rule or schema decision, a new shared contract, or a bug that resists a first fix. Call it again before you report the work complete. Skip it for small, dictated edits.
- Finish every module or feature with a handoff: write or update its file in `docs/handoffs/` (the same file as the work continues), as `AGENTS.md` describes, so another developer can take over from it. Use the `handoff` skill when available.
- Use adaptive thinking natively. Add no step-by-step scaffolding.
