# Behavioral Assessment templates in the web: scope note

Status: **built, browser pass open** (2026-11-24). The list, the builder (create, save as draft, publish), the details page, the edit of a draft, the publish of a draft, and the edit of a published template (its next version) are in the web and the backend. Archive and duplicate wait for backend routes. The state is in `docs/handoffs/2026-11-24-behavioral-template-new-version.md`.

Written 2026-11-24.

## Goal

Integrate the Behavioral Assessment templates into `web`. Integration only: connect the existing backend module to a working web feature. No change to the templates themselves (no new fields, rules, or layout of the template content).

## What exists (checked 2026-11-24)

Backend, `backend/src/modules/behavioral-assessment`:

- Controller `behavioral-assessment`: `GET /`, `GET /:id`, `POST /create`, `POST /:id/update`, `POST /:id/published`.
- Five entities, all in the `pms` schema: template, template version, section, question, choice option. `BehavioralQuestion` read `public` until 2026-11-24 and now maps to `pms`. A test (`backend/src/entity-schema.spec.ts`) keeps every entity in `pms`.
- `pms.behavioral_questions` exists on the local database (created by a local script) and holds 0 rows. `public.behavioral_questions` held 0 rows.

Shared contracts: `packages/shared-types/src/dtos/behavioral-template.schema.ts` and `domain/behavioral-question-type.enum.ts`.

Web: only a placeholder page, `web/src/app/(workspace)/reviews/templates/behavioral-assessment-template/page.tsx` (11 lines, `WorkspacePlaceholderTemplate`). Navigation entries and labels exist in `web/src/constants/workspace-navigation.ts` and `domain-labels.ts`. There is no `web/src/features/` folder for it.

## Known conflicts to settle first

- Done on 2026-11-24 (hersvin agreed): the backend follows the KPI logic. Admin role guard on every route, company and actor from the account through `CompanyResolver`, no company in the DTO, `req.user.userId` in the controller. The entity maps `company` text. The web integration still has to call the routes as an admin.
- `schema/behavioral-assessments.sql` now has `company text NOT NULL` (changed with the KPI text change), so a fresh database loads.
- The KPI module is the pattern to follow: list, create form, details, and edit pages under `web/src/features/review-templates`, with a server action and the `pms-session` cookie. Reuse it before writing new code.

## Open questions for the restart

1. Does the web feature need the company field, or does the backend take the company from the account (as KPI does through `CompanyResolver`)?
2. Which pages: list, builder, details, edit, and publish? The backend has no archive route.
3. Answered on 2026-11-24: yes. The PRD gives the same next step for both (a published template: create the next version, or archive). `POST behavioral-assessment/:id/versions` works like the KPI route: it locks the template row, publishes version N+1 frozen at once, and keeps version N as it is.
4. Is the backend owner changing `behavioral-assessment`, and in what order relative to the KPI text change?

## Not in this note

No code, no test, no schema change. The review that led here is `docs/reviews/2026-11-24-auth-pms-schema-review.md`.
