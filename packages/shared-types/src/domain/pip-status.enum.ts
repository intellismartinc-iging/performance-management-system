import { z } from "zod";

/**
 * Source: CHECK on pms.pip_plans.state in packages/database/schema.sql.
 */
export const PIP_STATUSES = [
  "awaiting_planning",
  "draft",
  "active",
  "completed",
  "not_met",
  "cancelled",
] as const;

export const pipStatusSchema = z.enum(PIP_STATUSES);
export type PipStatus = z.infer<typeof pipStatusSchema>;

/** How a plan can be closed: the two end states of pms.pip_plans.state. */
export const PIP_CLOSE_OUTCOMES = ["completed", "not_met"] as const;
export const pipCloseOutcomeSchema = z.enum(PIP_CLOSE_OUTCOMES);
export type PipCloseOutcome = z.infer<typeof pipCloseOutcomeSchema>;
