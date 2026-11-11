# Component Topology Specification

## Role / Authority

- **Role:** Structural decomposition of software components, container boundaries, module relationships, and the canonical repository directory tree.
- **Authority:** Primary reference context for component-level system topology and filesystem layout. When a path in `docs/plan/` disagrees with this file, this file wins and the plan is corrected.
- **Must not define:** Physical database schema keys or low-level function implementation code.

---

## 1. Container & Component Breakdown

Standard Reference: C4 Model Container Diagram Level 2 ([c4model.com](https://c4model.com))

The system decomposes into four primary architectural units managed directly at the repository root with npm workspaces:

1. **Frontend Web Application (`frontend/`):**
   - Host: Vercel.
   - Framework: Next.js 16 (React 19) App Router with React Server Components.
   - Responsibilities: Public marketing platform, interactive Quote Wizard, Talent Network Intake, authenticated Client Portal, Freelancer Portal, and Admin Control Center.
2. **Backend API Service (`backend/`):**
   - Host: Railway container runtime.
   - Framework: NestJS 11 modular architecture with TypeScript.
   - Responsibilities: Domain business logic, authorization, lead qualification pipeline, talent screening, project milestone contracts, dynamic tiered fee calculation (20%, 15%, 10%) locked at assignment time, and BullMQ background task processing.
3. **Database & Persistent Storage (`packages/database/`):**
   - Host: Supabase Cloud.
   - Engine: PostgreSQL 16 with Row-Level Security (RLS) policies and private storage buckets for resume documents and payment proofs.
   - Access layer: Prisma ORM 6. The schema lives in `prisma/schema.prisma`. Prisma Migrate generates the versioned SQL migrations.
4. **Shared Types & DTO Contracts (`packages/shared-types/`):**
   - Zero-runtime-dependency TypeScript library sharing Zod schemas, domain entity definitions, and system enums across frontend and backend.

---

## 2. Canonical Repository Directory Tree

Two conventions apply to the whole tree and are not repeated on every line:

- Routes live inside route groups: `(public)`, `(auth)`, `(portal)`, and `(admin)`. A group folder holds one `layout.tsx` and its routes. The parentheses keep the group name out of the URL.
- Every route folder holds three files: `page.tsx`, `loading.tsx`, and `error.tsx`. A route handler folder holds `route.ts` only.
- Every backend feature module under `backend/src/modules/` holds `controllers/`, `services/`, `dto/`, and `<name>.module.ts`.

```text
vetted-studi0/
├── AGENTS.md                          # Repository instructions and agent boundaries
├── CLAUDE.md                          # Claude Code entry point
├── package.json                       # Root workspaces: ["packages/*", "frontend", "backend"]
├── tsconfig.base.json                 # Shared strict TypeScript 5 configuration
├── .env.local.example                 # Template for .env.local: database URLs and the keys the seed scripts need
├── .mcp.json                          # Project MCP servers for Claude Code: Supabase, scoped to the development project, and Figma
├── eslint.config.mjs                  # ESLint rules for packages/. frontend/ has its own config.
├── .prettierrc                        # Prettier configuration
├── .husky/pre-commit                  # Runs lint-staged before every commit
├── sauron.config.yaml                 # Agent harness configuration
├── schema/sauron.schema.json          # JSON schema that validates sauron.config.yaml
├── .github/workflows/                 # ci.yml (quality gate) and release.yml (version tags). No deploy workflow.
├── .github/pull_request_template.md   # Pre-merge checklist
├── .agents/skills/                    # Portable agent skills, grouped by department
├── .claude/                           # Claude Code commands, rules, skills, hooks
├── scripts/                           # Session resume helpers
│
├── frontend/                          # Next.js 16 App Router frontend application
│   ├── public/                        # Static assets. Folders mirror src/components/
│   │   ├── icons/                     # Favicon PNGs, the Apple touch icon, and the Android icons (PNG only)
│   │   ├── layout/                    # Assets used by layout components: logo and social icons
│   │   ├── site.webmanifest           # Install name, colors, and icons. Stays at the root of public/
│   │   └── features/<domain>/         # Assets used by one feature. Public pages: features/public/shared/ and features/public/home/
│   ├── src/
│   │   ├── app/                       # Routing only. No business rules.
│   │   │   ├── (public)/              # Public marketing and intake routes
│   │   │   │   ├── layout.tsx         # Marketing header and footer
│   │   │   │   ├── (home)/            # Home page. The parentheses keep the URL at "/"
│   │   │   │   │   ├── page.tsx       # Hero, services, capabilities, how it works, portfolio, leadership, FAQ
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── services/          # AI Express, Starter, Growth, Pro package breakdown
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── care-plans/        # Basic, Growth, and Pro Care Plan tiers
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── how-it-works/      # 4-step vetting and delivery guarantee
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── portfolio/         # Verified case studies and live demos
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── about/             # Mission, delivery practices, and approved team profiles
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── faq/               # Pricing, timelines, revision policies
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── quote/             # Three-step local quote preview with review
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── join/              # Freelancer application and CV upload
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   └── contact/           # General inquiries
│   │   │   │       ├── page.tsx
│   │   │   │       ├── loading.tsx
│   │   │   │       └── error.tsx
│   │   │   ├── (auth)/                # Authentication flows
│   │   │   │   ├── layout.tsx         # Centered auth card shell
│   │   │   │   ├── login/             # Portal-aware login (?portal=client|freelancer|admin)
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── register/          # Client registration
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── forgot-password/   # Password reset request
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   ├── reset-password/    # Token-based password update
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   └── auth/callback/     # OAuth and invite redirect handler (/auth/callback)
│   │   │   │       └── route.ts
│   │   │   ├── (portal)/              # Authenticated client and talent dashboards
│   │   │   │   ├── layout.tsx         # Shared portal shell. Renders the header for the signed-in role.
│   │   │   │   ├── client/            # Active projects, milestones, deliverables
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   ├── error.tsx
│   │   │   │   │   ├── projects/
│   │   │   │   │   │   └── [id]/      # Milestone stepper and staging review
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       ├── loading.tsx
│   │   │   │   │   │       └── error.tsx
│   │   │   │   │   ├── invoices/      # Invoice history, payment instructions, proof upload
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   └── error.tsx
│   │   │   │   │   └── care-plans/    # Retainer status, remaining edit minutes, edit requests
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── loading.tsx
│   │   │   │   │       └── error.tsx
│   │   │   │   └── talent/            # Vetting status, assigned briefs, tier badge
│   │   │   │       ├── page.tsx
│   │   │   │       ├── loading.tsx
│   │   │   │       ├── error.tsx
│   │   │   │       ├── projects/
│   │   │   │       │   └── [id]/      # Project brief and deliverable submission
│   │   │   │       │       ├── page.tsx
│   │   │   │       │       ├── loading.tsx
│   │   │   │       │       └── error.tsx
│   │   │   │       ├── payouts/       # Earnings history and payout status
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── loading.tsx
│   │   │   │       │   └── error.tsx
│   │   │   │       └── maintenance/   # Monthly Care Plan checklist
│   │   │   │           ├── page.tsx
│   │   │   │           ├── loading.tsx
│   │   │   │           └── error.tsx
│   │   │   ├── (admin)/               # Co-founder control center
│   │   │   │   ├── layout.tsx         # Admin sidebar shell
│   │   │   │   └── admin/             # Pipeline metrics overview
│   │   │   │       ├── page.tsx
│   │   │   │       ├── loading.tsx
│   │   │   │       ├── error.tsx
│   │   │   │       ├── leads/         # Lead qualification table
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── loading.tsx
│   │   │   │       │   └── error.tsx
│   │   │   │       ├── talent/        # Vetting, CV download, approval
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── loading.tsx
│   │   │   │       │   ├── error.tsx
│   │   │   │       │   └── tier-reviews/ # 40/30/30 scorecard evaluation
│   │   │   │       │       ├── page.tsx
│   │   │   │       │       ├── loading.tsx
│   │   │   │       │       └── error.tsx
│   │   │   │       ├── projects/      # Active projects and specialist assignment
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── loading.tsx
│   │   │   │       │   └── error.tsx
│   │   │   │       ├── care-plans/    # MRR oversight and specialist reassignment
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── loading.tsx
│   │   │   │       │   └── error.tsx
│   │   │   │       └── financials/    # Invoice generator, payment reconciliation, 50/50 tracker
│   │   │   │           ├── page.tsx
│   │   │   │           ├── loading.tsx
│   │   │   │           └── error.tsx
│   │   │   ├── layout.tsx             # Root layout: fonts and providers only
│   │   │   ├── globals.css            # Tailwind CSS 4 entry and design tokens
│   │   │   ├── not-found.tsx          # Custom 404 page
│   │   │   ├── robots.ts              # Dynamic robots.txt
│   │   │   └── sitemap.ts             # Dynamic sitemap.xml
│   │   │
│   │   ├── components/
│   │   │   ├── layout/                # App shell layout primitives
│   │   │   │   ├── header.tsx         # Public header with Client Portal and Talent Network triggers
│   │   │   │   ├── header-nav.tsx     # Client leaf: primary links with the current page marker
│   │   │   │   ├── site-logo.tsx      # Logo link to the home page, used by header and footer
│   │   │   │   ├── action-link.tsx    # Link styled as an action button (primary, outline, ghost)
│   │   │   │   ├── mobile-nav-drawer.tsx # Responsive drawer navigation
│   │   │   │   ├── footer.tsx         # Public marketing footer
│   │   │   │   ├── footer-socials.tsx # Client leaf: social links, with a toast for pages that are not live
│   │   │   │   ├── portal-sidebar.tsx # Authenticated dashboard navigation sidebar
│   │   │   │   └── portal-header.tsx  # Authenticated topbar with role pill and logout
│   │   │   ├── shared/                # Generic reusable components (kebab-case)
│   │   │   │   ├── file-dropzone.tsx  # Accessible drag-and-drop file uploader
│   │   │   │   ├── page-placeholder.tsx # Temporary body for a route whose page is not built yet
│   │   │   │   ├── route-loading.tsx  # Skeleton for a route that still shows the placeholder
│   │   │   │   ├── route-error.tsx    # Error message with a Try Again action, used by every error.tsx
│   │   │   │   ├── empty-state.tsx    # Empty table or list placeholder
│   │   │   │   └── stat-card.tsx      # Key metric display card
│   │   │   ├── ui/                    # Base UI/shadcn primitives; additional catalog explicitly requested on 2026-10-25
│   │   │   │   ├── accordion.tsx      # FAQ and expandable rows
│   │   │   │   ├── alert.tsx          # Inline status callout
│   │   │   │   ├── alert-dialog.tsx   # Confirmation for irreversible actions
│   │   │   │   ├── aspect-ratio.tsx   # Fixed-ratio media frame
│   │   │   │   ├── attachment.tsx     # File display primitive; quote files stay local
│   │   │   │   ├── avatar.tsx         # User and specialist profile avatar
│   │   │   │   ├── badge.tsx          # Status and tier badge, one hue per meaning
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── empty.tsx          # Shared empty state, including quote file selection
│   │   │   │   ├── field.tsx          # Label, control, helper, and error wrapper
│   │   │   │   ├── gradient-waves.tsx # Vendored React Bits WebGL background (uses ogl)
│   │   │   │   ├── input.tsx
│   │   │   │   ├── input-group.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── questionnaire.tsx  # Installed catalog; quote keeps its existing form/navigation owners
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── skeleton.tsx       # Used by every loading.tsx
│   │   │   │   ├── spinner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx           # Segmented portal role switcher tabs
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   └── toast.tsx
│   │   │   ├── providers/             # Client providers mounted in the root layout
│   │   │   │   └── query-provider.tsx # TanStack Query provider
│   │   │   └── features/              # Domain-specific component containers
│   │   │       ├── public/            # Marketing pages of app/(public). A page folder imports from shared/, never from another page folder.
│   │   │       │   ├── shared/        # Sections used by two or more public pages. A section moves here when its second page ships.
│   │   │       │   │   ├── section-container.tsx  # Page-width column of a section: gutters, vertical padding, 1440px cap
│   │   │       │   │   ├── section-heading.tsx    # The h2 and optional description of a section
│   │   │       │   │   ├── services-section.tsx   # Services and Packages cards. Home and /services
│   │   │       │   │   ├── services-section-skeleton.tsx # Loading skeleton shaped like the cards
│   │   │       │   │   ├── package-card.tsx       # Package card with the price and the amount due to start
│   │   │       │   │   ├── capabilities-section.tsx   # Specialized Capabilities. Home and /services
│   │   │       │   │   ├── capability-card.tsx    # Card used by the capabilities section
│   │   │       │   │   ├── capabilities-section-skeleton.tsx # Loading skeleton shaped like the cards
│   │   │       │   │   ├── page-hero-section.tsx  # Dark heading band of a public page other than home. Copy and action come from the page
│   │   │       │   │   ├── page-hero-section-skeleton.tsx # Loading skeleton shaped like the page hero
│   │   │       │   │   ├── quote-cta-section.tsx  # Closing banner with the quote action. Copy comes from the page
│   │   │       │   │   ├── quote-cta-section-skeleton.tsx # Loading skeleton shaped like the banner
│   │   │       │   │   ├── process-steps.tsx      # The four delivery steps. Home and /how-it-works
│   │   │       │   │   ├── process-steps-skeleton.tsx # Loading skeleton shaped like the four steps
│   │   │       │   │   ├── process-step.tsx       # One step: timeline on mobile, card on tablet, column on desktop
│   │   │       │   │   ├── process-step-illustration.tsx # The designer's SVG illustration for a step
│   │   │       │   │   ├── double-wave-backdrop.tsx # Double wave: home FAQ and /portfolio
│   │   │       │   │   ├── team-member-card.tsx # Shared home/About profile card; optional horizontal lead layout
│   │   │       │   │   ├── portfolio-empty-state.tsx  # Shown while no client project is published
│   │   │       │   │   └── portfolio-empty-state-skeleton.tsx # Loading skeleton shaped like the empty state
│   │   │       │   ├── home/          # Sections that only the home page shows
│   │   │       │   │   ├── hero-section.tsx
│   │   │       │   │   ├── hero-waves.tsx         # Client leaf: loads the wave background on desktop widths only
│   │   │       │   │   ├── hero-waves-canvas.tsx  # Reads token colors and renders the WebGL waves
│   │   │       │   │   ├── hero-section-skeleton.tsx  # Loading skeleton shaped like the hero
│   │   │       │   │   ├── how-it-works-section.tsx   # Heading, the shared steps, the process banner, and the closing call to action
│   │   │       │   │   ├── how-it-works-section-skeleton.tsx # Loading skeleton shaped like the section
│   │   │       │   │   ├── portfolio-section.tsx
│   │   │       │   │   ├── leadership-section.tsx     # About leadership
│   │   │       │   │   └── faq-section.tsx
│   │   │       │   ├── services/      # Sections that only the /services page shows
│   │   │       │   │   ├── comparison-section.tsx     # Heading, the table, and the accordion
│   │   │       │   │   ├── comparison-table.tsx       # Package comparison on tablet and desktop
│   │   │       │   │   ├── comparison-accordion.tsx   # Package comparison on mobile
│   │   │       │   │   ├── comparison-cell-content.tsx # One comparison value, used by the table and the accordion
│   │   │       │   │   └── comparison-section-skeleton.tsx # Loading skeleton shaped like the table and the accordion
│   │   │       │   ├── care-plans/    # Public Care Plan tiers
│   │   │       │   │   └── care-plan-tiers.tsx
│   │   │       │   ├── how-it-works/  # Sections that only the /how-it-works page shows
│   │   │       │   │   ├── client-journey-section.tsx # Heading over the shared four steps
│   │   │       │   │   ├── client-journey-section-skeleton.tsx # Loading skeleton shaped like the section
│   │   │       │   │   ├── vetting-section.tsx        # The four screening stages
│   │   │       │   │   ├── vetting-stage-card.tsx     # One stage: checklist or pipeline under the divider
│   │   │       │   │   └── vetting-section-skeleton.tsx # Loading skeleton shaped like the cards
│   │   │       │   ├── about/         # Agency mission and approved team profiles
│   │   │       │   │   ├── about-content.tsx # Mission, practice cards, and common questions
│   │   │       │   │   └── team-section.tsx # Technical lead and filtered profile grid
│   │   │       │   ├── portfolio/     # Sections that only the /portfolio page shows
│   │   │       │   │   ├── projects-backdrop.tsx      # Double wave and top line behind the projects and the closing banner
│   │   │       │   │   ├── projects-section.tsx       # Heading and the empty state. Case study cards arrive with the first published project
│   │   │       │   │   ├── projects-section-skeleton.tsx # Loading skeleton shaped like the section
│   │   │       │   │   ├── case-study-card.tsx        # Planned
│   │   │       │   │   └── live-preview-frame.tsx     # Planned
│   │   │       │   ├── faq/           # Public client and freelancer knowledge base
│   │   │       │   │   └── faq-browser.tsx # Search, categories, accordions, animated audience controls
│   │   │       │   └── quote/         # Local quote UI preview; backend submission deferred
│   │   │       │       ├── quote-wizard.tsx # Responsive shell and preview completion
│   │   │       │       ├── quote-sidebar.tsx # Progress and live brief summary
│   │   │       │       ├── quote-service-step.tsx # Service/package and feature priorities
│   │   │       │       ├── quote-details-step.tsx # Budget, timeline, brief, reference links
│   │   │       │       ├── quote-contact-step.tsx # Required name/email, optional company/phone
│   │   │       │       ├── quote-review.tsx # Read-only review with edit actions
│   │   │       │       ├── quote-field.tsx # Labeled native fields and accessible errors
│   │   │       │       └── quote-attachments.tsx # Validated local files only
│   │   │       ├── talent-intake/     # Freelancer onboarding components
│   │   │       │   ├── talent-form.tsx
│   │   │       │   ├── skill-pills.tsx
│   │   │       │   ├── resume-dropzone.tsx # Drag-and-drop CV uploader (PDF or DOCX, 10MB limit)
│   │   │       │   └── portfolio-inputs.tsx
│   │   │       ├── contact/           # General inquiry form
│   │   │       │   └── contact-form.tsx
│   │   │       ├── auth/              # Authentication forms
│   │   │       │   ├── login-form.tsx
│   │   │       │   ├── register-form.tsx
│   │   │       │   └── forgot-password-form.tsx
│   │   │       ├── client-portal/     # Client project tracking
│   │   │       │   ├── milestone-stepper.tsx
│   │   │       │   ├── deliverable-links.tsx
│   │   │       │   ├── billing-card.tsx
│   │   │       │   ├── invoice-table.tsx
│   │   │       │   ├── payment-modal.tsx          # Payment instructions by rail
│   │   │       │   ├── payment-confirmation-form.tsx # Reference number and proof upload
│   │   │       │   ├── care-plan-status.tsx       # Retainer status and remaining monthly edit minutes
│   │   │       │   ├── edit-request-drawer.tsx    # Content change request drawer
│   │   │       │   └── edit-history-table.tsx
│   │   │       ├── talent-portal/     # Freelancer workspace
│   │   │       │   ├── assigned-briefs.tsx
│   │   │       │   ├── project-brief-viewer.tsx
│   │   │       │   ├── submission-modal.tsx
│   │   │       │   ├── payout-status.tsx
│   │   │       │   ├── deadline-badge.tsx
│   │   │       │   ├── maintenance-tasks.tsx      # Monthly Care Plan verification checklist
│   │   │       │   └── audit-history-feed.tsx
│   │   │       └── admin-portal/      # Dennis Gutierrez and Miguel Enrique Dasalla control center
│   │   │           ├── lead-pipeline-table.tsx
│   │   │           ├── talent-table.tsx
│   │   │           ├── talent-vetting-modal.tsx   # Portfolio review, CV download, approval actions
│   │   │           ├── tier-review-scorecard.tsx  # 40/30/30 evaluation form
│   │   │           ├── project-assigner.tsx
│   │   │           ├── revenue-tracker.tsx
│   │   │           ├── invoice-modal.tsx          # Invoice generator
│   │   │           ├── reconcile-payment-modal.tsx
│   │   │           └── care-plans-table.tsx       # Active MRR oversight and specialist reassignment
│   │   │
│   │   ├── hooks/                     # One subfolder per kind of hook
│   │   │   ├── public/use-quote-preview.ts # Single quote form, guarded steps, local completion
│   │   │   ├── ui/                    # Small browser and UI hooks
│   │   │   │   └── use-media-query.ts # Subscribes to a CSS media query
│   │   │   └── queries/               # TanStack Query hooks. The only place queries and mutations are declared
│   │   │       ├── use-quote-mutation.ts # Planned after quote UI approval
│   │   │       ├── use-talent-intake.ts
│   │   │       ├── use-projects.ts
│   │   │       ├── use-invoices.ts
│   │   │       ├── use-care-plans.ts
│   │   │       ├── use-leads.ts
│   │   │       ├── use-talent.ts
│   │   │       └── use-auth.ts
│   │   │
│   │   ├── services/                  # Typed API client wrappers called by hooks
│   │   │   ├── api.service.ts         # Native fetch wrapper with Supabase JWT injection
│   │   │   ├── lead.service.ts
│   │   │   ├── talent.service.ts      # Sends the resume as multipart form data to the API
│   │   │   ├── project.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── care-plan.service.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── stores/                    # Zustand stores: EPHEMERAL UI state ONLY (never DB records)
│   │   │   ├── quote/quote-navigation.store.ts # Per-wizard navigation/completion only
│   │   │   ├── modal.store.ts         # Which modal or drawer is open, plus the id of the record it concerns
│   │   │   └── filter.store.ts        # Client-side table sort and filter criteria
│   │   │
│   │   ├── constants/                 # Static values (UPPER_SNAKE_CASE), one subfolder per area
│   │   │   ├── site/                  # Values used across the whole site
│   │   │   │   ├── site.ts            # SITE_CONFIG: name, URL, metadata copy, tagline, social links
│   │   │   │   ├── navigation.ts      # HEADER_NAV_LINKS, SITE_PAGE_LINKS, and the header and footer action links
│   │   │   │   └── routes.ts          # LIVE_ROUTE_PATHS: pages that are built. Other action links show a toast
│   │   │   └── public/                # Copy and data of the public marketing pages
│   │   │       ├── home.ts            # HERO_CONTENT, hero actions, and industries
│   │   │       ├── services.ts        # SERVICE_PACKAGES: names, prices, amount due to start, features, turnaround
│   │   │       ├── services-page.ts   # /services hero, comparison rows, and closing banner copy
│   │   │       ├── capabilities.ts    # CAPABILITIES: the four specialized capability cards
│   │   │       ├── how-it-works.ts    # PROCESS_STEPS, the process banner, and the get started copy
│   │   │       ├── how-it-works-page.ts # /how-it-works hero, journey heading, vetting stages, and closing banner copy
│   │   │       ├── portfolio.ts       # Published projects and the empty state copy
│   │   │       ├── portfolio-page.ts  # /portfolio hero, projects heading, and closing banner copy
│   │   │       ├── leadership.ts      # Approved home/About team profiles and card styles
│   │   │       ├── about-page.ts      # About hero, mission, practices, filters, questions, and quote action
│   │   │       ├── quote.ts           # Quote choices, file limits, and initial form values
│   │   │       ├── faq.ts             # Home FAQ_ITEMS
│   │   │       └── faq-page.ts        # Public FAQ copy and 300ms audience transition duration
│   │   ├── utils/                     # date.utils.ts, currency.utils.ts, validation.utils.ts, file.utils.ts
│   │   ├── types/                     # UI-only view types and component props in *.types.ts files, one subfolder per area. Domain entities come from @vetted/shared-types.
│   │   │   ├── layout/                # layout.types.ts, navigation.types.ts
│   │   │   ├── shared/                # route.types.ts: props of components/shared/
│   │   │   ├── public/                # home.types.ts, services.types.ts, how-it-works.types.ts, faq.types.ts, public.types.ts
│   │   │   ├── providers/             # providers.types.ts
│   │   │   └── lib/                   # logger.types.ts
│   │   ├── schemas/                   # Frontend-only Zod schemas in *.schema.ts files, one subfolder per area. Request schemas come from @vetted/shared-types.
│   │   │   └── lib/
│   │   │       └── env.schema.ts      # Schema of the public environment variables
│   │   ├── lib/
│   │   │   ├── utils.ts               # cn() class merger, configured with the design system type scale
│   │   │   ├── supabase/client.ts     # Browser client. Used for authentication only.
│   │   │   ├── supabase/server.ts     # Server client reading cookies
│   │   │   ├── dayjs.ts               # Day.js instance with plugins
│   │   │   ├── query-client.ts        # TanStack QueryClient configuration
│   │   │   ├── env.ts                 # Zod validation of the public environment variables
│   │   │   └── logger.ts
│   │   └── proxy.ts                   # Next.js 16 root proxy (session check, portal isolation)
│   │
│   ├── tests/                         # unit/, components/, integration/, e2e/ (Playwright)
│   ├── tsconfig.json
│   ├── package.json
│   ├── next.config.ts
│   └── vitest.config.mts
│
├── backend/                           # NestJS 11 modular backend service
│   ├── src/
│   │   ├── config/                    # Zod-validated environment and service configuration
│   │   │   ├── env.config.ts          # Zod schema, Env type, validateEnv
│   │   │   └── (supabase, redis, resend).config.ts   # Added only when a provider needs more than one variable
│   │   │
│   │   ├── common/                    # Cross-cutting framework adapters
│   │   │   ├── decorators/            # roles.decorator.ts, current-user.decorator.ts, public.decorator.ts
│   │   │   ├── filters/               # rfc7807-exception.filter.ts
│   │   │   ├── guards/                # jwt.strategy.ts, jwt-auth.guard.ts, roles.guard.ts, rate-limit.guard.ts
│   │   │   ├── types/                 # authenticated-user.ts (Session, AuthenticatedUser)
│   │   │   ├── utils/                 # multipart.ts (form lists), storage-paths.ts (buckets, file rules, generated paths)
│   │   │   ├── interceptors/          # transform.interceptor.ts (request logging is done by nestjs-pino)
│   │   │   ├── pipes/                 # zod-validation.pipe.ts, file-validation.pipe.ts
│   │   │   └── exceptions/            # domain.exception.ts, resource-not-found.exception.ts, unauthorized-domain.exception.ts
│   │   │
│   │   ├── core/                      # Singleton infrastructure providers
│   │   │   ├── database/              # prisma.module.ts, prisma.service.ts (PrismaClient from @vetted/database)
│   │   │   ├── storage/               # Supabase Storage provider: uploads and signed URLs
│   │   │   ├── supabase/              # supabase.module.ts: one service role client for the Auth admin API and Storage
│   │   │   ├── redis/                 # Redis connection, role cache, rate limit counters
│   │   │   └── queues/                # BullMQ registration: queue.module.ts, queue.constants.ts
│   │   │
│   │   ├── modules/                   # Self-contained feature modules
│   │   │   ├── auth/                  # JWT verification, GET /auth/me, account provisioning, role cache
│   │   │   ├── leads/                 # POST /api/v1/leads, lead status state machine
│   │   │   ├── talent/                # POST /api/v1/talent/join, vetting states, POST /api/v1/talent/tier-review
│   │   │   ├── projects/              # Lead conversion, ordered milestones, deliverables with file upload
│   │   │   ├── assignments/           # The six assignment rules, the fee locked at assignment time, milestone payouts
│   │   │   ├── invoices/              # INV-YYYY-NNNN numbers, payment proof, reconciliation
│   │   │   ├── contact/               # POST /api/v1/contact
│   │   │   ├── notifications/         # processors/email.processor.ts, services/ (email, notifications), templates/email-templates.ts, notification-job.types.ts
│   │   │   ├── admin/                 # Every admin controller, admin.roles.ts (AnyAdmin, SuperAdminOnly), services/metrics.service.ts
│   │   │   ├── care-plans/            # Subscriptions, monthly checklist, edit requests, processors/rollover.processor.ts
│   │   │   └── health/                # health.controller.ts, redis.health.ts, queue.health.ts, health.timeout.ts
│   │   │
│   │   ├── app.module.ts              # Root NestJS module aggregating all feature modules
│   │   ├── instrument.ts              # Sentry initialization, imported first by main.ts
│   │   └── main.ts                    # Bootstrap entry point (Swagger, CORS, global filters)
│   │
│   ├── scripts/                       # smoke-auth.mjs, smoke-flow.mjs: checks against a running API with real tokens
│   ├── docs/openapi.json              # Exported by npm run openapi:export -w backend
│   │
│   ├── docs/openapi.json              # Exported OpenAPI 3.0 specification
│   ├── Dockerfile                     # Two-stage Node.js 22 image built from the repository root
│   ├── test/                          # unit/ today. integration/ and e2e/ (Supertest) arrive with the feature modules
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── package.json
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   └── vitest.config.mts
│
├── packages/
│   ├── database/                      # Prisma schema, migrations, RLS policies, seeds
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Single source of truth for tables, enums, and indexes
│   │   │   └── migrations/            # Prisma Migrate output: <timestamp>_<name>/migration.sql
│   │   ├── seeds/                     # founders.seed.ts (the two founder roles), dev-users.seed.ts (one account per role, Storage buckets, sample project)
│   │   ├── scripts/                   # verify-schema.mjs (npm run db:verify: RLS, constraints, triggers), count-rows.mjs (npm run db:count)
│   │   ├── src/index.ts               # Exports the generated PrismaClient as @vetted/database
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared-types/                  # Shared TypeScript types and Zod DTO contracts
│       ├── src/
│       │   ├── dtos/                  # lead, talent, contact, project, assignment, invoice, care-plan
│       │   └── domain/                # Entities and enums
│       │       ├── role.enum.ts           # admin | client | freelancer
│       │       ├── package-tier.enum.ts   # ai_express | starter | growth | pro | custom
│       │       ├── freelancer-tier.enum.ts # new_talent | vetted_talent | vetted_pro
│       │       ├── vetting-status.enum.ts # pending | approved | rejected
│       │       └── project-status.enum.ts # scoping | in_progress | review | completed
│       ├── tsconfig.json
│       └── package.json
│
├── postman/                           # Versioned Postman v3 collection and local environment file
├── tests/postman/files/               # Fixture files that the collection uploads
└── docs/                              # Engineering documentation and modular domain taxonomy
```

RLS policies and CHECK constraints that Prisma schema syntax cannot express are written as raw SQL inside the generated migration files under `packages/database/prisma/migrations/`.

---

## 3. Component Dependencies & Communication Invariants

- **Authentication preview:** `(auth)/layout.tsx` provides the standalone canvas and waves.
  `/login` renders `features/auth/login-preview.tsx`; `recovery-preview.tsx` owns a local dialog.
  UI-only types, constants, and validation live in `types/auth`, `constants/auth`, `schemas/auth`.
  Shared `corner-waves.tsx` serves auth and 404 using the existing decorative SVG assets.
  Auth preview imports no service or Supabase client and creates no session.

- **Network application preview:** `/join` renders `features/public/join/join-preview.tsx`.
  `join-field`, `join-skills`, and `join-resume` compose existing UI primitives.
  Constants, UI types, and local schemas live outside components. The shared talent schema
  remains the future request contract. Current completion performs no backend operation.

- **Missing routes:** Root `app/not-found.tsx` renders the public `not-found-page.tsx` feature.
  Link groups live in `constants/public/not-found.ts`. Decorative waves live in
  `public/features/public/not-found/`. Shared `Card` and `ActionLink` provide recovery UI.
  Future portal destinations retain the existing maintenance notice.

- **Dependency direction:**
  - `frontend/` imports from `packages/shared-types`. It never imports from `backend/` or `packages/database`.
  - `backend/` imports from `packages/shared-types` and `packages/database`. All table access goes through `PrismaService`.
  - `packages/shared-types` has zero runtime dependencies on `frontend/` or `backend/`.
- **One mutation path in the frontend:** A component calls a TanStack Query hook in `hooks/`. The hook calls a wrapper in `services/`. The wrapper calls the NestJS API. Server Actions are not used for mutations, and components do not call `fetch` directly.
- **Browser access to Supabase is limited to authentication.** The browser never queries tables and never uploads to Storage directly. File uploads go to the API as multipart form data. File downloads use short-lived signed URLs issued by the API.
- **Communication channels:**
  - Synchronous: HTTPS JSON REST calls from `frontend/` to `backend/api/v1/`.
  - Asynchronous: BullMQ Redis job queues decoupling email dispatch from web response loops.
- **Redis is reachable from the backend only.** It runs on the Railway private network. Code running on Vercel, including `proxy.ts`, never connects to Redis.
