import { z } from "zod";

/**
 * Source: CHECK on pms.pip_week_assessments.outcome in packages/database/schema.sql.
 */
export const PIP_WEEK_RESULTS = ["met", "not_met", "missed"] as const;

export const pipWeekResultSchema = z.enum(PIP_WEEK_RESULTS);
export type PipWeekResult = z.infer<typeof pipWeekResultSchema>;
