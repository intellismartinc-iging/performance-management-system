import { z } from "zod";

/**
 * Source: CHECK on pms.pip_week_updates.status in packages/database/schema.sql.
 */
export const PIP_WEEK_UPDATE_STATUSES = [
  "draft",
  "submitted",
  "returned",
] as const;

export const pipWeekUpdateStatusSchema = z.enum(PIP_WEEK_UPDATE_STATUSES);
export type PipWeekUpdateStatus = z.infer<typeof pipWeekUpdateStatusSchema>;
