import { z } from "zod";
import { evaluatorTypeSchema } from "../domain/evaluator-type.enum.js";
import { reviewTypeSchema } from "../domain/review-type.enum.js";
import {
  dateOnlySchema,
  requiredTextSchema,
  timestampSchema,
} from "../common.js";
import { cycleStagesRowSchema, cyclesRowSchema } from "../rows/index.js";

export const cycleStageDtoSchema = cycleStagesRowSchema;
export type CycleStageDto = z.infer<typeof cycleStageDtoSchema>;

export const reviewCycleDtoSchema = cyclesRowSchema.extend({
  /** ASSUMPTION: the API embeds stages. */
  stages: z.array(cycleStageDtoSchema).optional(),
});
export type ReviewCycleDto = z.infer<typeof reviewCycleDtoSchema>;

const stageRequestSchema = z.object({
  perspective: evaluatorTypeSchema,
  evaluatorRole: requiredTextSchema,
  deadline: timestampSchema,
});

/**
 * Mirrors the database CHECK rules so errors show before the request. The
 * weights are fractions (the column default is 0.50 each) and must total 1.
 */
export const createReviewCycleRequestSchema = z
  .object({
    name: requiredTextSchema,
    reviewType: reviewTypeSchema,
    evaluationStart: dateOnlySchema,
    evaluationEnd: dateOnlySchema,
    assessmentStart: timestampSchema,
    verificationDeadline: timestampSchema,
    goalsWeight: z.number().min(0).max(1),
    behavioralWeight: z.number().min(0).max(1),
    anonymityThreshold: z
      .number()
      .int()
      .min(2)
      .max(10)
      .nullable()
      .default(null),
    stages: z.array(stageRequestSchema).min(1, "Add at least one stage."),
  })
  .superRefine((cycle, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (cycle.evaluationEnd < cycle.evaluationStart) {
      issue(
        "evaluationEnd",
        "The period end cannot be before the period start.",
      );
    }
    if (cycle.verificationDeadline < cycle.assessmentStart) {
      issue(
        "verificationDeadline",
        "The verification deadline cannot be before assessment starts.",
      );
    }
    if (Math.abs(cycle.goalsWeight + cycle.behavioralWeight - 1) > 0.0001) {
      issue("behavioralWeight", "Goal and behavioral weights must total 1.");
    }
  });
export type CreateReviewCycleRequestDto = z.infer<
  typeof createReviewCycleRequestSchema
>;
