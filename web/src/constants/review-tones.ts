/**
 * The five status tones shared by badges, timelines, and charts. Class names
 * are written out in full so Tailwind can detect them.
 */
export type ReviewTone = "neutral" | "active" | "queued" | "complete" | "alert";

export const REVIEW_TONE_SURFACE_CLASS = {
  neutral: "bg-(--pms-review-neutral-surface)",
  active: "bg-(--pms-review-active-surface)",
  queued: "bg-(--pms-review-queued-surface)",
  complete: "bg-(--pms-review-complete-surface)",
  alert: "bg-(--pms-review-alert-surface)",
} as const satisfies Record<ReviewTone, string>;

export const REVIEW_TONE_ACCENT_CLASS = {
  neutral: "bg-(--pms-review-neutral-accent)",
  active: "bg-(--pms-review-active-accent)",
  queued: "bg-(--pms-review-queued-accent)",
  complete: "bg-(--pms-review-complete-accent)",
  alert: "bg-(--pms-review-alert-accent)",
} as const satisfies Record<ReviewTone, string>;

/** CSS color values for SVG fills and inline styles. */
export const REVIEW_TONE_ACCENT_COLOR = {
  neutral: "var(--pms-review-neutral-accent)",
  active: "var(--pms-review-active-accent)",
  queued: "var(--pms-review-queued-accent)",
  complete: "var(--pms-review-complete-accent)",
  alert: "var(--pms-review-alert-accent)",
} as const satisfies Record<ReviewTone, string>;
