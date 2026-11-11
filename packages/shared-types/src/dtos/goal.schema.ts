import { z } from "zod";
import { goalCategorySchema } from "../domain/goal-category.enum.js";
import { goalTrackingModeSchema } from "../domain/goal-tracking-mode.enum.js";
import {
  dateOnlySchema,
  idSchema,
  percentInputSchema,
  requiredTextSchema,
} from "../common.js";
import {
  goalMilestonesRowSchema,
  goalProgressUpdatesRowSchema,
  operationalGoalsRowSchema,
} from "../rows/index.js";

export const goalMilestoneDtoSchema = goalMilestonesRowSchema;
export type GoalMilestoneDto = z.infer<typeof goalMilestoneDtoSchema>;

export const goalDtoSchema = operationalGoalsRowSchema.extend({
  /** ASSUMPTION: the API embeds milestones. Remove if they are fetched apart. */
  milestones: z.array(goalMilestoneDtoSchema).optional(),
});
export type GoalDto = z.infer<typeof goalDtoSchema>;

export const goalUpdateDtoSchema = goalProgressUpdatesRowSchema;
export type GoalUpdateDto = z.infer<typeof goalUpdateDtoSchema>;

/** Create goal form. */
export const createGoalRequestSchema = z
  .object({
    ownerId: idSchema,
    name: requiredTextSchema.max(200),
    description: z.string().trim().default(""),
    category: goalCategorySchema,
    trackingMode: goalTrackingModeSchema,
    startDate: dateOnlySchema,
    dueDate: dateOnlySchema,
    milestones: z
      .array(
        z.object({
          title: requiredTextSchema,
          dueDate: dateOnlySchema.nullable().default(null),
        }),
      )
      .default([]),
  })
  .refine((value) => value.dueDate >= value.startDate, {
    message: "The due date cannot be before the start date.",
    path: ["dueDate"],
  });
export type CreateGoalRequestDto = z.infer<typeof createGoalRequestSchema>;

/** Update Progress dialog. */
export const updateGoalProgressRequestSchema = z.object({
  progressPercent: percentInputSchema,
  comment: requiredTextSchema,
});
export type UpdateGoalProgressRequestDto = z.infer<
  typeof updateGoalProgressRequestSchema
>;
