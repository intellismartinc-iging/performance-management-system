# @pms/web

The PMS web app: a Next.js 16 App Router project with a workspace shell, a shared component library, and the login flow. It reads contracts from `@pms/shared-types` and talks to the API in `backend/`.

## Overview

- Login and sign-up pages call the API from a server action and keep the access token in the httpOnly cookie `pms-session`.
- `src/proxy.ts` redirects every page by that cookie. Logged-out visitors go to `/login`. Logged-in users go from `/login` to `/`.
- The workspace (`src/app/(workspace)`) has a sidebar, a header with the live Manila date and time, a notification menu, and an account menu with a light and dark theme switch.
- The pages for reviews, review cycles, goals, PIP, employees, reports, my team, and 202 files exist as routes. Most render a placeholder template. Review cycles renders the listing template with a notice.
- Feature components for cycle setup, template editors, evaluator scoring, and KPI reporting exist in `src/features`. They are not connected to routes or the API yet.

## Tech Stack

Next.js 16.4 with the React Compiler and `cacheComponents`, React 19.3, Tailwind CSS 4, shadcn on Base UI (`@base-ui/react`), TanStack Query, Zustand, react-hook-form, Recharts, `next-themes`, Zod 4, and Axios (server side only). Tests use Vitest and Testing Library.

## Architecture

### Folder Structure

```text
src/
├── app/            Routes: (auth) login, register, sign-up; (workspace) pages; error and not-found pages
├── components/     ui (shadcn), atoms, molecules, organisms, templates
├── features/       auth, evaluations, position-goals, review-cycles, review-templates
├── layouts/        Workspace and auth layouts, account menu, clock
├── constants/      Navigation, workspace config, review tones, domain labels
├── context/        Theme and query providers
├── stores/         Zustand stores
├── hooks/          Shared hooks
├── api/            Server-side API client
├── lib/ utils/     Helpers
├── styles/         Design tokens: colors, typography, layout, motion, surfaces
├── types/          UI view types
└── proxy.ts        Route guard
```

The rules for each folder are in [llm.txt](llm.txt). The design tokens and the contrast proof are in [DESIGN.md](DESIGN.md).

### Application Flow

1. `src/features/auth/components/credentials-form.tsx` submits to the server action `submitCredentials`.
2. The action validates the input with the schemas from `@pms/shared-types` and posts to `PMS_API_BASE_URL`.
3. On login success it sets `pms-session` and redirects to `/`.
4. `src/proxy.ts` runs before each page and decides to continue or redirect.

### Design Patterns

- A request body is built in a feature `services/` folder from a form draft and checked with a shared schema (for example `features/review-templates/services/template-requests.ts`).
- Domain codes from the database become words only in `src/constants/domain-labels.ts`.

## Prerequisites

Node.js 24 and pnpm 12.14.0. Install from the repository root with `pnpm install`.

## Configuration

```bash
cp .env.example .env.local
```

| Variable           | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `PMS_API_BASE_URL` | Base URL of the API. The example value is `http://localhost:4000/` |

## Running the Project

```bash
pnpm dev
```

Open `http://localhost:3000`. From the repository root, `pnpm dev:web` runs the same command. The login page needs the API running.

## Development

| Task      | Command          |
| --------- | ---------------- |
| Build     | `pnpm build`     |
| Start     | `pnpm start`     |
| Lint      | `pnpm lint`      |
| Typecheck | `pnpm typecheck` (runs `next typegen` first) |

ESLint blocks imports from `@pms/backend` and `@pms/database`, deep imports into `@pms/shared-types`, and relative paths into another workspace.

## Testing

```bash
pnpm test
```

Vitest runs `tests/unit`, `tests/component`, and `tests/integration`. Today the only test file is `tests/unit/session-guard.test.ts`, which covers the route guard rules. `tests/e2e` is empty.

## Project Structure

Routes: `/login`, `/register`, `/sign-up`, `/`, `/reviews`, `/reviews/templates/kpi-goal-template`, `/reviews/templates/behavioral-assessment-template`, `/review-cycles`, `/goals`, `/pip`, `/202-files`, `/employees`, `/my-team`, `/reports`.
