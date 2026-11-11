# PMS: HRDotNet Performance Management System

A monorepo for the HRDotNet Performance Management System (PMS). It holds a Next.js web app, a NestJS API, a shared Zod contracts package, and the PostgreSQL schema. The database schema models review cycles, KPI goal templates, behavioral assessments, evaluator assignments, accomplishments, NTE notices, performance improvement plans (PIP), operational goals, and notifications.

## Features

What exists in the code today:

- **Authentication.** The web app logs a user in or creates a login from an employee code. The API issues a JWT access token. The web server action stores it in an httpOnly cookie, and `web/src/proxy.ts` redirects pages by that cookie.
- **Workspace shell.** A responsive sidebar, a header with the live Manila date and time, a notification menu, an account menu with a light and dark theme switch, and a role preview switcher (employee, manager, HR administrator).
- **Component library.** Shared components under `web/src/components`: data table, listing, detail and form page templates, charts, dialogs, form fields, and skeleton loading states.
- **Feature components** for cycle setup, KPI and behavioral template editors, KPI reporting and verification, and evaluator scoring. They are not routed to pages or connected to the API yet. Nine of the workspace pages render a placeholder template.
- **API.** Authentication, employees, KPI goal templates, and behavioral assessment templates. See [backend/README.md](backend/README.md).
- **Shared contracts.** Zod enums, one generated row schema for each of the 40 tables, and request and response DTOs. See [packages/shared-types/README.md](packages/shared-types/README.md).

## Tech Stack

| Area      | Technology                                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web       | Next.js 16.4 (App Router, React Compiler, `cacheComponents`), React 19.3, Tailwind CSS 4, shadcn on Base UI, TanStack Query, Zustand, react-hook-form, Recharts |
| API       | NestJS 12, TypeORM, Passport JWT, Swagger, class-validator                                                                                                      |
| Data      | PostgreSQL (main database), SQL Server (read-only HRDotNet source)                                                                                              |
| Contracts | Zod 4, TypeScript 5.9                                                                                                                                           |
| Tooling   | pnpm 12 workspaces, ESLint 9, oxlint, Prettier, Vitest, Husky, lint-staged, GitHub Actions                                                                      |

## Architecture

### Folder Structure

```text
.
├── web/                      Next.js app (@pms/web)
├── backend/                  NestJS API (@pms/backend)
├── packages/
│   ├── shared-types/         Zod contracts (@pms/shared-types)
│   └── database/             PostgreSQL schema and seed (@pms/database)
├── docs/                     Workspace blueprint
├── .github/                  CI workflow and CODEOWNERS
├── package.json              Root scripts
├── pnpm-workspace.yaml       Workspaces, dependency catalog
└── tsconfig.base.json        Shared TypeScript settings for packages
```

### Application Flow

1. You submit the login form in `web`. A server action posts `identifier` and `password` to `POST /auth/login` on the API.
2. The API checks the password and returns `{ accessToken, expiresIn }`.
3. The server action stores the token in the httpOnly cookie `pms-session` and redirects to `/`.
4. On each page request, `web/src/proxy.ts` reads the cookie and its `exp` claim and redirects you to `/login` when the session is missing or expired.
5. The API verifies the token signature on every protected route.

### Design Patterns

- **Layered API modules.** Each Nest module has a controller, a service, entities, and DTO classes.
- **Generated contracts.** `packages/shared-types` generates one row schema per table from `packages/database/schema.sql`. CI fails when the generated files are out of date.
- **Dependency boundaries.** `web` imports `@pms/shared-types` only. `shared-types` imports no other workspace package. Lint enforces both. See [docs/workspace-blueprint.md](docs/workspace-blueprint.md).

## Prerequisites

- Node.js 24 (the CI version)
- pnpm 12.14.0 (`corepack enable` reads the version from `packageManager`)
- PostgreSQL for the main database
- SQL Server access to the HRDotNet database. The API stops at startup when the `DB_*` variables are missing.

## Installation

```bash
git clone https://github.com/iti-vin/performance-management-system.git
cd performance-management-system
pnpm install
```

`pnpm install` also builds `packages/*`, because the root `postinstall` script runs `pnpm run build:packages`.

## Configuration

Copy the example files and fill in the values.

```bash
cp web/.env.example web/.env.local
cp backend/.env.example backend/.env
```

| Variable                                            | Used by | Purpose                                                       |
| --------------------------------------------------- | ------- | ------------------------------------------------------------- |
| `PMS_API_BASE_URL`                                  | web     | Base URL of the API, for example `http://localhost:4000/`     |
| `PORT`                                              | backend | API port. The default is 3000, the same as the web dev server |
| `POSTGRES_HOST`, `POSTGRES_PORT`                    | backend | Main database. Defaults: `localhost`, `5433`                  |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | backend | Main database. Defaults: `postgres`, `postgres`, empty        |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`                 | backend | HRDotNet SQL Server. `DB_PORT` defaults to `1433`             |
| `DB_USERNAME`, `DB_PASSWORD`                        | backend | HRDotNet SQL Server login                                     |
| `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE`         | backend | `true` or `false`                                             |
| `JWT_ACCESS_SECRET`                                 | backend | Secret that signs access tokens                               |

`backend/.env.example` lists the `DB_*`, `PORT`, and `JWT_*` variables. It does not list the `POSTGRES_*` variables, so add them yourself.

## Running the Project

Start the API on port 4000 and the web app on port 3000, in two terminals:

```bash
PORT=4000 pnpm dev:backend
pnpm dev:web
```

On Windows PowerShell, set the port first: `$env:PORT=4000; pnpm dev:backend`.

Open `http://localhost:3000`. Swagger for the API is at `http://localhost:4000/swagger`.

To create the database and load the schema and sample data:

```bash
pnpm --filter @pms/database db:init
```

## Development

| Task                        | Command                                    |
| --------------------------- | ------------------------------------------ |
| Build everything            | `pnpm build`                               |
| Lint                        | `pnpm lint`                                |
| Typecheck                   | `pnpm typecheck`                           |
| Rebuild the shared packages | `pnpm build:packages`                      |
| Regenerate row schemas      | `pnpm --filter @pms/shared-types generate` |
| Format                      | `pnpm format`                              |

After you edit `packages/shared-types/src`, run `pnpm build:packages`, because `web` and `backend` read `dist/`. After you edit `packages/database/schema.sql`, run `generate` and then `pnpm build:packages`.

A pre-commit hook (Husky and lint-staged) runs ESLint and Prettier on staged TypeScript in `packages/`, and Prettier on staged JSON, Markdown, and YAML in the root. `.github/CODEOWNERS` assigns reviews to the owners listed in it. GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, lint, build, and tests for the packages that changed, on pushes to `main` and on pull requests.

Contributor instructions for coding agents are in [AGENTS.md](AGENTS.md).

## Testing

```bash
pnpm test
```

This runs the `shared-types` tests (they compare the enums and generated rows with `schema.sql`), the web tests (route guard rules), and the backend tests. These fail today and are left out of CI: the backend `auth.service.spec.ts` (Nest dependency error) and the `packages/database` test (`pnpm --filter @pms/database test`).

## Project Structure

See [Folder Structure](#folder-structure) above. Each workspace has its own README:

- [web/README.md](web/README.md)
- [backend/README.md](backend/README.md)
- [packages/README.md](packages/README.md)
