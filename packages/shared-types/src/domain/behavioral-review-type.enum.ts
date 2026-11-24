import { z } from "zod";

/**
 * Source: CHECK on pms.behavioral_templates.review_type in packages/database/schema.sql.
 * Who the form is for. "others" is a label only: it has no text of its own.
 */
export const BEHAVIORAL_REVIEW_TYPES = [
  "self",
  "manager",
  "peer",
  "upward",
  "hr",
  "others",
] as const;

export const behavioralReviewTypeSchema = z.enum(BEHAVIORAL_REVIEW_TYPES);
export type BehavioralReviewType = z.infer<typeof behavioralReviewTypeSchema>;
