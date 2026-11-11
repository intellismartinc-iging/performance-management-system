import { z } from "zod";

/**
 * Source: CHECK on pms.cycle_stages.perspective in packages/database/schema.sql.
 */
export const EVALUATOR_TYPES = [
  "self",
  "manager",
  "hr",
  "peer",
  "upward",
] as const;

export const evaluatorTypeSchema = z.enum(EVALUATOR_TYPES);
export type EvaluatorType = z.infer<typeof evaluatorTypeSchema>;
