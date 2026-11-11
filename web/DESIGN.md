# DESIGN.md

HRDotNet Performance Management (PMS) front end. Written 2026-11-10 from the files in `src/styles/` and `src/app/globals.css`.

## 0. How to use this file

- **Target:** web, Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn `base-nova` on Base UI, light and dark theme through `next-themes`.
- **Source of truth:** the CSS files. This file explains them and records the contrast proof. If a value here differs from the CSS, the CSS wins, and this file is corrected.
- **Rule for every change:** a color, size, radius, shadow, or duration that is not already a token is added to the CSS first, then used. Components never hold one-off values.
- **Palette ownership:** the colors in section 2.1 come from the designer. Do not change them without the designer. Every other color is "derived" and says why.

| File | Holds |
| --- | --- |
| `src/styles/colors.css` | Designer palette (layer 1) and PMS color roles (layer 2) |
| `src/styles/surfaces.css` | Canvas, panel, floating, divider, control border, focus, scrim, radius, shadow, focus ring |
| `src/styles/typography.css` | Fonts and the type scale |
| `src/styles/layout.css` | Container, gutter, section, header, control, and touch sizes |
| `src/styles/motion.css` | Durations and easing |
| `src/styles/media.css` | Icon sizes, nav icon stroke, media aspect ratio |
| `src/app/globals.css` | Maps the tokens onto the shadcn roles, dark variant, base rules |

## 1. Theme

- Two themes: light and dark. The `dark` class on `<html>` selects dark.
- `next-themes` owns the class (`attribute="class"`, `defaultTheme="system"`, `enableSystem`). The first visit follows the operating system, and a choice made in the app wins afterwards.
- The switch is in the avatar menu, labeled "Theme", with the current theme written beside it ("Light" or "Dark").
- Tailwind `dark:` utilities use `@custom-variant dark (&:is(.dark *))`.
- The designer's guide defines light colors only. All dark colors are derived.
- The dark canvas is a dark slate (`#111827`), not black. Higher layers are lighter (canvas, panel, floating), because shadows barely show on dark.

## 2. Color

### 2.1 Designer palette (layer 1, `colors.css`)

Source: "HRDotNet Color Design System, Developer Handoff Guide", prepared 2026-11-09. The guide states the values are screenshot-derived and pending Figma verification. The logo gradient angle is also unverified.

**Base** (`--base-*`)

| Token | Hex | Guide usage |
| --- | --- | --- |
| `primary` | `#559CDA` | Primary UI emphasis |
| `secondary` | `#EBF6FA` | Secondary UI fill |
| `on-surface` | `#6D6D6D` | Content on surfaces |
| `on-surface-variant` | `#969696` | Alternate content on surfaces |
| `on-primary` | `#FFFFFF` | Content on primary backgrounds |
| `outline` | `#A8A8A8` | Borders and outlines |
| `outline-variant` | `#CCCCCC` | Alternate border treatment |
| `surface` | `#FFFFFF` | Surface background |
| `gray` | `#F5F5F5` | Neutral UI fill |
| `error` | `#FF4B34` | Error UI emphasis |
| `hrdotnet-logo` | gradient `#559CDA` 0%, `#7BADFF` 27%, `#FFB58D` 76%, `#ED8028` 100% | Brand logo, 90deg preview |

**Status** (`--status-*`)

| Token | Hex | Guide usage |
| --- | --- | --- |
| `failed` | `#CC2E1D` | Failed process or record |
| `cancelled` | `#FF4B34` | Cancelled record |
| `success` | `#FFA500` | Successful process or record |
| `regenerate` | `#00C3CA` | Regeneration action or state |
| `filed` | `#9B51E0` | Filed record |
| `posted` | `#559CDA` | Posted record |
| `closed` | `#969696` | Closed record |
| `approved` | `#1E8449` | Approved record |
| `reviewed` | `#ED8028` | Reviewed record |
| `for-approval` | `#FFB703` | Record awaiting approval |

**Attendance** (`--attendance-*`)

| Token | Hex | Token | Hex |
| --- | --- | --- | --- |
| `working-hours` | `#4FBF73` | `default-schedule` | `#D9B800` |
| `break-time` | `#2E8B57` | `work-schedule` | `#8F8CFF` |
| `tardy` | `#E67A4E` | `change-of-schedule` | `#FFB24A` |
| `undertime` | `#7CA68A` | `excess-hours` | `#80B8FF` |
| `missing-log` | `#E65C5C` | `overtime` | `#3F9DFF` |
| `no-logs` | `#B23636` | `official-business` | `#B180FF` |
| `holiday` | `#FF9999` | `night-differential` | `#5C6BC0` |
| `rest-day` | `#9A9A9A` | `night-differential-overtime` | `#3949AB` |
| `leave` | `#FF6FB5` | | |

**Calendar** (`--calendar-*`)

| Token | Hex | Token | Hex |
| --- | --- | --- | --- |
| `default-schedule` | `#FFF9C4` | `cos` | `#FFDEB2` |
| `work-schedule` | `#DAD9FF` | `overtime` | `#BFE1FF` |
| `processed-logs` | `#DBF3E0` | `rest-day` | `#EBEBEB` |
| `missing-or-no-logs` | `#FFC9C2` | `holiday` | `#FFE2DE` |
| `missed-log` | `#B6F0ED` | `leave` | `#FFD6F2` |
| `cto` | `#EDD2B7` | `official-business` | `#E6CCFF` |

`cto` and `cos` keep the guide's names. Their meanings are not confirmed.

The attendance and calendar tokens are defined and not used yet. They are for the attendance and calendar features.

### 2.2 PMS color roles (layer 2, `colors.css`)

Components read these, not the palette directly.

| Role | Light | Dark | Source |
| --- | --- | --- | --- |
| `--pms-surface` | `--base-surface` (`#FFFFFF`) | same | Guide |
| `--pms-text-on-action` | `--base-on-primary` (`#FFFFFF`) | `#0F172A` | Guide, dark derived |
| `--pms-action` | `#205B99` | `--base-primary` (`#559CDA`) | Derived |
| `--pms-action-hover` | `#194C80` | `#77AEE3` | Derived |
| `--pms-action-pressed` | `#143D67` | `#91BFEB` | Derived |
| `--pms-logo-blue` | `#01A7EC` | same | Derived from the logo cyan |
| `--pms-nav-selected` | `#0172A0` (logo blue 68% over black) | same | Derived |
| `--pms-nav-selected-hover` | `#016690` (61%) | same | Derived |
| `--pms-nav-selected-pressed` | `#015A7F` (54%) | same | Derived |
| `--pms-nav-selected-foreground` | `--base-on-primary` (`#FFFFFF`) | same | Guide |
| `--pms-nav-hover` | `#E6F6FD` (logo blue 10% over white) | `#18374A` | Derived |
| `--pms-nav-hover-foreground` | `#015A7F` | `#D8ECFF` | Derived |
| `--pms-ink-on-tint` | Tailwind slate-950 | same | Derived |

Why `--pms-action` is not `--base-primary`: white text on `#559CDA` is 2.94 to 1, below the 4.5 to 1 needed. `#205B99` is a darker blue that passes (6.96 to 1).

Why the selected nav item is the same in both themes: white on `#0172A0` is 5.36 to 1, and it stays readable on a dark sidebar. The earlier dark version (dark text on bright cyan) was hard to read.

### 2.3 Surfaces and edges (`surfaces.css`)

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `--pms-canvas` | `#F8FAFC` | `#111827` | Page background |
| `--pms-panel` | `--pms-surface` (`#FFFFFF`) | `#1B2534` | Cards and the sidebar |
| `--pms-floating` | `--pms-surface` (`#FFFFFF`) | `#253247` | Menus, popovers, dialogs |
| `--pms-divider` | `#DBE2EA` | `#41516A` | Decorative borders and dividers |
| `--pms-control-border` | `#778699` | `#8394AD` | Input, select, checkbox edges |
| `--pms-focus` | `#205B99` | `#A9D4FF` | Focus ring |
| `--pms-scrim` | `rgb(15 23 42 / 50%)` | `rgb(2 6 23 / 65%)` | Behind dialogs and sheets |

All are derived. The designer's `outline` (`#A8A8A8`) is 2.38 to 1 on white, so it cannot be a control border. `--pms-control-border` is a darker slate that reaches 3.7 to 1.

Depth language: borders separate resting surfaces, and shadows mark layers that float. In dark, height is shown by lighter surfaces.

### 2.4 shadcn roles (`globals.css`)

shadcn components read these names. They point at the PMS roles, or hold a derived neutral.

| shadcn role | Light | Dark |
| --- | --- | --- |
| `--background` | `--pms-canvas` | `--pms-canvas` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--card`, `--sidebar` | `--pms-panel` | `--pms-panel` |
| `--card-foreground`, `--popover-foreground`, `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--popover` | `--pms-floating` | `--pms-floating` |
| `--primary` | `--pms-action` | `--pms-action` |
| `--primary-foreground` | `--pms-text-on-action` | `--pms-text-on-action` |
| `--secondary`, `--muted`, `--accent`, `--sidebar-accent` | `--base-gray` (`#F5F5F5`) | `oklch(0.269 0 0)` |
| `--secondary-foreground`, `--accent-foreground`, `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--border`, `--sidebar-border` | `--pms-divider` | `--pms-divider` |
| `--input` | `--pms-control-border` | `--pms-control-border` |
| `--ring`, `--sidebar-ring` | `--pms-focus` | `--pms-focus` |
| `--sidebar-primary` | `--pms-nav-selected` | `--pms-nav-selected` |
| `--sidebar-primary-foreground` | `--pms-nav-selected-foreground` | `--pms-nav-selected-foreground` |
| `--radius` | `0.625rem` | same |

### 2.5 Review status tones (`colors.css`)

Five tones for status badges, timelines, and charts. They are derived and are not in the designer's guide. Each has a pastel surface (badge fill) and an accent (dots, markers, chart fills). Badge text always uses `--pms-ink-on-tint`. A status is always written as a word, never shown by color alone.

| Tone | Used for | Surface | Accent | Closest guide color |
| --- | --- | --- | --- | --- |
| `neutral` | Draft, Not Started, Archived | `#F0F3F6` | `#8897A4` | `status-closed` |
| `active` | Active, In Progress | `#EAF4FD` | `#5295CE` | `status-posted` |
| `queued` | Scheduled, Submitted | `#EFEDFF` | `#8D75C8` | `status-filed` |
| `complete` | Completed, Published | `#E4F7EE` | `#369773` | `status-approved` |
| `alert` | Overdue, Cancelled | `#FFECE9` | `#CA6D5D` | `status-failed` or `status-cancelled` |

The tones are the same in dark. The badges are light pastel blocks on a dark canvas. The contrast passes, and the look is a design decision still open (section 9).

In code: `REVIEW_TONE_SURFACE_CLASS`, `REVIEW_TONE_ACCENT_CLASS`, and `REVIEW_TONE_ACCENT_COLOR` in `src/constants/review-tones.ts`.

### 2.6 Theme switch (`colors.css`)

Derived. Tailwind palette colors, held as tokens: `--pms-switch-track` (gray-200), `--pms-switch-track-on` (gray-400), `--pms-switch-knob` (white), `--pms-switch-knob-on` (gray-800), `--pms-switch-sun` (amber-500), `--pms-switch-moon` (indigo-300). The darker "on" track was chosen so the switch is visible on the dark menu.

Toast feedback colors (`--pms-feedback-success`, `-info`, `-warning`, `-error`) color the toast icon and its left edge. Light: `--status-approved` (4.72 to 1 on white), `--pms-action` (6.96), amber-700 (5.02), `--status-failed` (5.28). Dark, on the dark popover: green-400 (7.41), `--base-primary` (4.40), `--status-reviewed` (4.75), red-400 (4.67). The designer's `--status-posted` and `--status-reviewed` are not used on light, because they measure 2.94 and 2.72 to 1 on white.

### 2.7 Contrast proof

Measured with the WCAG relative luminance formula on 2026-11-10. Text needs 4.5 to 1. Controls, icons, and focus need 3 to 1.

**Text**

| Pair | Light | Dark |
| --- | --- | --- |
| `--foreground` on canvas | 18.92 | 17.00 |
| `--foreground` on panel | 19.80 | 14.78 |
| `--muted-foreground` on canvas | 4.53 | 6.87 |
| `--muted-foreground` on panel | 4.74 | 5.97 |
| `--muted-foreground` on floating | 4.74 | 5.00 |
| `--pms-text-on-action` on `--pms-action` | 6.96 | 6.08 |
| Same, hover | 8.80 | 7.61 |
| Same, pressed | 11.09 | 9.23 |
| Nav selected foreground on nav selected | 5.36 | 5.36 |
| Nav hover foreground on nav hover | 6.85 | 10.31 |
| `--destructive` on panel | 4.77 | 5.34 |
| `--destructive` on canvas | 4.56 | 6.14 |
| Badge ink on tone surface | 17.5 to 18.1 (all five) | same |

**Non-text**

| Pair | Light | Dark |
| --- | --- | --- |
| Control border on panel | 3.71 | 5.00 |
| Control border on canvas | 3.55 | n/a |
| Focus ring on canvas (light) or panel (dark) | 6.65 | 9.96 |
| Focus ring on white panel (light) | 6.96 | n/a |
| Divider on panel (decorative, no minimum) | 1.31 | 1.92 |
| Tone accents on white | 3.00 to 3.81 | n/a |
| Tone accents on dark panel | n/a | 4.05 to 5.15 |
| Tone accents on dark floating | n/a | 3.39 to 4.31 |
| Theme switch track on dark menu | n/a | 4.96 |

Known near-limit: `--muted-foreground` on the light canvas is 4.53, only just above 4.5.

### 2.8 Designer palette contrast on white

For the designer's review. A value under 3 to 1 must not carry meaning alone, and must not be text.

- **Base:** `primary` 2.94, `on-surface-variant` 2.96, `outline` 2.38, `outline-variant` 1.61.
- **Status:** `success` 1.97, `regenerate` 2.17, `posted` 2.94, `closed` 2.96, `reviewed` 2.72, `for-approval` 1.75.
- **Attendance:** 12 of 17 are under 3, for example `default-schedule` 1.94 and `change-of-schedule` 1.79.
- **Calendar:** these are pastel fills. Text ink on all twelve is at least 13.8 to 1.

### 2.9 Color rules

1. Components read `--pms-*` roles or the shadcn roles. They do not read `--base-*`, `--status-*`, `--attendance-*`, or `--calendar-*` directly, except where a feature uses its own category palette (attendance and calendar).
2. No hard-coded Tailwind colors in components. Add a token first.
3. In Tailwind classes, write `text-(color:--token)` for a text color from a variable. `text-(--token)` can be read as a font size.
4. Status, errors, and selection are never shown by color alone: use a word, an icon, or a shape too.
5. Do not use `--base-on-surface-variant`, `--base-outline`, or `--base-outline-variant` as text or as an input border on white. They fail contrast.

## 3. Typography (`typography.css`)

Fonts: Inter for body and headings (`--font-sans`, `--font-heading`, from `--font-inter`), and JetBrains Mono for code (`--font-mono`). Both load through `next/font`.

| Token | Size | Line height | Tracking | Weight | Use |
| --- | --- | --- | --- | --- | --- |
| `text-pms-page-title` | `clamp(1.25rem, 1.1786rem + 0.3571vw, 1.5rem)` (20 to 24 px) | 1.3 | -0.02em | 600 | Page title (`h1`) |
| `text-pms-section-title` | `clamp(1rem, 0.9286rem + 0.3571vw, 1.25rem)` (16 to 20 px) | 1.4 | -0.01em | 600 | Card and section titles |
| `text-pms-metric` | `1.5rem` | 1.25 | none | 600 | Metric card value |
| `text-pms-body` | `1rem` | 1.6 | none | 400 | Body text |
| `text-pms-table` | `0.875rem` | 1.5 | none | 400 | Tables and dense content |
| `text-pms-label` | `0.8125rem` | 1.5 | none | 500 | Field labels, tags, helper text |

- `container-pms-copy` is `65ch`: the maximum width of reading text.
- Numbers in tables and metrics use `tabular-nums`.
- Skeleton bars use the same text class as the line they stand for, with height `1lh`, so they follow the fluid size.

## 4. Layout and spacing (`layout.css`)

| Token | Value | Use |
| --- | --- | --- |
| `container-pms-dashboard` | `90rem` (1440 px) | Maximum content width |
| `spacing-pms-gutter` | `clamp(1rem, 4vw, 2rem)` | Side padding |
| `spacing-pms-section` | `clamp(1.5rem, 4vw, 3rem)` | Space between page sections |
| `spacing-pms-header` | `4rem` (64 px) | Header height |
| `spacing-pms-control` | `2.5rem` (40 px) | Dense control height |
| `spacing-pms-touch` | `2.75rem` (44 px) | Minimum target size. Use `min-h-pms-touch` and `min-w-pms-touch`. |

- Breakpoints are the Tailwind defaults (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem). The mobile hook (`use-mobile`) switches at 1024 px.
- Check widths for visual review: 320, 375, 425, 768, 1024, 1440.
- Page shell: `px-3 py-6`, a `gap-4` grid. Cards use `rounded-pms-card border border-border bg-card p-4`.

## 5. Surface and depth (`surfaces.css`)

**Radius** (the "soft" personality)

| Token | Value | Use |
| --- | --- | --- |
| `rounded-pms-tag` | `0.25rem` (4 px) | Badges, tags |
| `rounded-pms-control` | `0.5rem` (8 px) | Buttons, inputs, menu items |
| `rounded-pms-card` | `0.75rem` (12 px) | Cards, panels |
| `rounded-pms-overlay` | `1rem` (16 px) | Dialogs, menus, sheets |

In `globals.css`, `radius-sm`, `-lg`, `-xl`, and `-2xl` point at these. `radius-md`, `-3xl`, and `-4xl` are still computed from `--radius` (see section 9).

**Shadow**

| Token | Value | Use |
| --- | --- | --- |
| `shadow-pms-float` | `0 2px 4px rgb(15 23 42 / 12%), 0 6px 12px rgb(15 23 42 / 10%)` | Menus, popovers, tooltips |
| `shadow-pms-overlay` | `0 4px 8px rgb(15 23 42 / 14%), 0 12px 24px rgb(15 23 42 / 16%)` | Dialogs, sheets |

Resting cards have a border and no shadow. A floating layer always has a shadow. In dark, floating layers also use a lighter surface.

**Focus ring:** `3px solid var(--pms-focus)`, offset `2px`, on every `:focus-visible`. An input group shows the ring on the group. Under `forced-colors: active`, the ring color is `Highlight`.

**Overlay:** dialogs, alert dialogs, and sheets sit on `--pms-scrim` with a light backdrop blur.

## 6. Motion (`motion.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--pms-motion-feedback` | `100ms` | Press and hover feedback |
| `--pms-motion-tooltip` | `150ms` | Tooltips |
| `--pms-motion-disclosure` | `240ms` | Accordions, expanding rows |
| `--pms-motion-overlay` | `400ms` | Dialogs and sheets |
| `--ease-pms-enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | Things entering |
| `--ease-pms-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving |

- Animation uses Tailwind transitions and `tw-animate-css`. There is no animation library.
- The theme switch knob slides for `400ms` with `ease-out`, and the sun and moon fade.
- Animate `transform` and `opacity`. Do not animate layout.
- The 404 illustration animates by itself (a designer file) and is shown as an image so its own animation runs.
- The theme provider does not disable transitions on change, because that would stop the knob from sliding.

## 7. Icons and media (`media.css`)

| Token | Value | Use |
| --- | --- | --- |
| `size-pms-icon-inline` | `1rem` | Icons in text and menu items |
| `size-pms-icon-control` | `1.25rem` | Icons in buttons and fields |
| `size-pms-icon-nav` | `1.5rem` | Navigation icons |
| `size-pms-icon-empty` | `2rem` | Empty and error states |
| `--pms-nav-active-icon-stroke` | `2.5` | Stroke of the active nav icon |
| `aspect-pms-media-card` | `4 / 3` | Card media |

- Icons come from `lucide-react`. They are `aria-hidden` when a label sits beside them, and an icon-only control has an `aria-label`.
- Decorative images use `alt=""`. Meaningful images have a description (the 404 robot is described).

## 8. Shared building blocks

Reusable components that carry these tokens, in `src/components/`:

- Atoms: `StatusBadge`, `ProgressCell`, `ScoreBar`, `AchievementBadge`.
- Molecules: `PageHeader`, `MetricCard`, `ListingToolbar`, `FilterBar`, `ListingTabs`, `ListingPagination`, `FormField`, `FormSelect`, `FormSection`, `ErrorSummary`, `DateField`, `EmployeeLookup`, `PersonCell`, `RowActionsMenu`, `Stepper`, `Timeline`, `DefinitionGrid`, `ReasonDialog`, `ConfirmationDialog`, `UnsavedChangesDialog`, `ExportButton`, `ThemeToggle`.
- Organisms: `DataTable`, `BarChart`, `DonutChart`, `NotificationMenu`, `NotFoundState`, `ErrorState`.
- Templates: `ListingPageTemplate`, `DetailPageTemplate`, `FormPageTemplate`.
- Loading: every page template and the main shared parts export a skeleton with the same layout, and `(workspace)/loading.tsx` shows the listing skeleton by default.

## 9. Open items

For the designer:

1. Confirm or replace the review tones in section 2.5, and the dark look of the badges.
2. Confirm the meaning of `cto` and `cos`.
3. `status-success` is orange and close to `for-approval` and `reviewed`. Confirm this is intended, because `approved` is the green.
4. Provide dark theme values, or approve the derived ones.
5. Verify every palette value in Figma, and the logo gradient angle.
6. The guide's `primary`, `on-surface-variant`, `outline`, and many attendance and status colors are under 3 to 1 on white (section 2.8). Decide how they may be used.

For the team:

1. `--muted-foreground` (`oklch(0.556 0 0)`, about `#737373`) could point at `--base-on-surface` (`#6D6D6D`) to match the guide and raise contrast from 4.53 to 5.17. It changes the color slightly.
2. `globals.css` still mixes the PMS radius scale with the shadcn `--radius` calculation (`radius-md`, `-3xl`, `-4xl`).
3. No `theme-color` meta tag is set for the two themes.
4. `motion.css` has no reduced-motion rule. Some components add `motion-reduce:` utilities on their own.
5. The pure grey neutrals in dark (`oklch(0.269 0 0)`) have no tint. The canvas is slate.
