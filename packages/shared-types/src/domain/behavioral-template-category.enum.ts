import { z } from "zod";

/**
 * Source: CHECK on pms.behavioral_templates.category in packages/database/schema.sql.
 * "others" is a label only: it has no text of its own.
 */
export const BEHAVIORAL_TEMPLATE_CATEGORIES = [
  "general_performance",
  "self_assessment",
  "manager_evaluation",
  "peer_feedback",
  "feedback_360",
  "probationary_evaluation",
  "others",
] as const;

export const behavioralTemplateCategorySchema = z.enum(
  BEHAVIORAL_TEMPLATE_CATEGORIES,
);
export type BehavioralTemplateCategory = z.infer<
  typeof behavioralTemplateCategorySchema
>;
