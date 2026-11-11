import { z } from "zod";

/**
 * Source: CHECK on pms.pip_weeks.status in packages/database/schema.sql.
 */
export const PIP_WEEK_STATUSES = [
  "pending",
  "active",
  "completed",
  "not_met",
] as const;

export const pipWeekStatusSchema = z.enum(PIP_WEEK_STATUSES);
export type PipWeekStatus = z.infer<typeof pipWeekStatusSchema>;
