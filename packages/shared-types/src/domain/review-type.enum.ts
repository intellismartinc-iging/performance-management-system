import { z } from "zod";

/**
 * Source: CHECK on pms.cycles.review_type in packages/database/schema.sql.
 */
export const REVIEW_TYPES = [
  "standard",
  "360",
  "probationary",
  "project_based",
] as const;

export const reviewTypeSchema = z.enum(REVIEW_TYPES);
export type ReviewType = z.infer<typeof reviewTypeSchema>;
