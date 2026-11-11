@AGENTS.md

## Claude Code

- Lean code is always on for any request that writes or changes code. The full rule is in AGENTS.md, because the skill files are gitignored and may not exist on this machine. End every coding task with the Lean Report.
- Outline the blast radius before a change that touches more than one workspace (`web`, `backend`, `packages/*`).
- Ask before a destructive command: `git reset --hard`, `git push --force`, `rm -rf`, dropping a table.
- Read the `AGENTS.md` and `CLAUDE.md` inside `web/` or `backend/` when you work in that folder.
- Use adaptive thinking natively. Add no step-by-step scaffolding.
- Before you add a UI component, check `web/src/components` for one that already does the job.
