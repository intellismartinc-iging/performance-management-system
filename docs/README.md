# Documentation

Product and engineering documents for the HRDotNet Performance Management System (PMS). One topic per file, kebab-case names. Update a document in the same pull request as the change it describes. Put no secret in a document: refer to `.env.example`.

| Document                                                                                     | Subject                                                                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [product-requirements-document.md](product-requirements-document.md)                         | What the system does                                                                       |
| [system-architecture.md](system-architecture.md)                                             | Topology, technology stack, directory layout, module boundaries, request flows, invariants |
| [project-structure.md](project-structure.md)                                                 | Folder map and the rule each folder follows                                                |
| [workspace-blueprint.md](workspace-blueprint.md)                                             | Workspaces, ownership, builds, and releases                                                |
| [coding-standards.md](coding-standards.md)                                                   | Backend coding conventions                                                                 |
| [engineering-rules.md](engineering-rules.md)                                                 | Rules for every change                                                                     |
| [api-contracts.md](api-contracts.md)                                                         | Endpoints and response shapes                                                              |
| [error-handling.md](error-handling.md)                                                       | Error categories, envelope, and status codes                                               |
| [database-design.md](database-design.md), [database-schema.md](database-schema.md)           | The logical model, tables, and columns                                                     |
| [security-policies.md](security-policies.md)                                                 | Security rules                                                                             |
| [legacy-gap-analysis.md](legacy-gap-analysis.md)                                             | What the legacy web app has that `web/` lacks                                              |
| [handoffs/](handoffs/README.md)                                                              | State snapshots for whoever continues a piece of work                                      |
| [reviews/2026-11-24-auth-pms-schema-review.md](reviews/2026-11-24-auth-pms-schema-review.md) | Review of PR 8 (auth and employees on the `pms` schema) from the KPI side                  |
| [behavioral-assessment-web-integration.md](behavioral-assessment-web-integration.md)         | Paused scope note for the Behavioral Assessment templates in the web                       |

## Related

- `AGENTS.md` and `CLAUDE.md` at the repository root: instructions for coding agents.
- `web/DESIGN.md` and `web/llm.txt`: design tokens and the rules of every web folder.
