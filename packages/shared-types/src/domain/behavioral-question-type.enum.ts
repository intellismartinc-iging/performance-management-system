import { z } from "zod";

/**
 * Source: CHECK on pms.behavioral_questions.question_type in packages/database/schema.sql.
 */
export const BEHAVIORAL_QUESTION_TYPES = [
  "rating_scale",
  "short_answer",
  "paragraph",
  "multiple_choice",
] as const;

export const behavioralQuestionTypeSchema = z.enum(BEHAVIORAL_QUESTION_TYPES);
export type BehavioralQuestionType = z.infer<
  typeof behavioralQuestionTypeSchema
>;
