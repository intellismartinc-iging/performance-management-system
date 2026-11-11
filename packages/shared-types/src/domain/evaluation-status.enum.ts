import { z } from "zod";

/**
 * Source: CHECK on pms.assignments.state in packages/database/schema.sql.
 */
export const EVALUATION_STATUSES = [
  "locked",
  "not_started",
  "in_progress",
  "submitted",
  "completed",
] as const;

export const evaluationStatusSchema = z.enum(EVALUATION_STATUSES);
export type EvaluationStatus = z.infer<typeof evaluationStatusSchema>;
