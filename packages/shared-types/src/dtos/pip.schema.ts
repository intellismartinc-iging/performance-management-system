import { z } from "zod";
import { kpiDirectionSchema } from "../domain/kpi-direction.enum.js";
import { pipCloseOutcomeSchema } from "../domain/pip-status.enum.js";
import { pipWeekResultSchema } from "../domain/pip-week-result.enum.js";
import {
  addDays,
  dateOnlySchema,
  idSchema,
  nonNegativeInputSchema,
  requiredTextSchema,
} from "../common.js";
import {
  auditEventsRowSchema,
  pipPlansRowSchema,
  pipSourcesRowSchema,
  pipWeekAssessmentsRowSchema,
  pipWeekUpdatesRowSchema,
  pipWeeksRowSchema,
} from "../rows/index.js";

/** A failed indicator that opened the plan. An exclusion is `exclusionReason` on it. */
export const improvementPlanSourceDtoSchema = pipSourcesRowSchema;
export type ImprovementPlanSourceDto = z.infer<
  typeof improvementPlanSourceDtoSchema
>;

/** The employee's weekly update. */
export const improvementWeekSubmissionDtoSchema = pipWeekUpdatesRowSchema;
export type ImprovementWeekSubmissionDto = z.infer<
  typeof improvementWeekSubmissionDtoSchema
>;

/** The manager's weekly assessment. */
export const improvementWeekAssessmentDtoSchema = pipWeekAssessmentsRowSchema;
export type ImprovementWeekAssessmentDto = z.infer<
  typeof improvementWeekAssessmentDtoSchema
>;

export const improvementPlanWeekDtoSchema = pipWeeksRowSchema.extend({
  /** ASSUMPTION: the API embeds updates and assessments. */
  updates: z.array(improvementWeekSubmissionDtoSchema).optional(),
  assessments: z.array(improvementWeekAssessmentDtoSchema).optional(),
});
export type ImprovementPlanWeekDto = z.infer<
  typeof improvementPlanWeekDtoSchema
>;

export const improvementPlanDtoSchema = pipPlansRowSchema.extend({
  /** ASSUMPTION: the API embeds sources and weeks. */
  sources: z.array(improvementPlanSourceDtoSchema).optional(),
  weeks: z.array(improvementPlanWeekDtoSchema).optional(),
});
export type ImprovementPlanDto = z.infer<typeof improvementPlanDtoSchema>;

export const improvementPlanHistoryDtoSchema = auditEventsRowSchema;
export type ImprovementPlanHistoryDto = z.infer<
  typeof improvementPlanHistoryDtoSchema
>;

/** A plan week lasts 7 days: the end date is the start date plus 6. */
export const planWeekRequestSchema = z
  .object({
    focus: requiredTextSchema,
    goalDescription: requiredTextSchema,
    targetValue: nonNegativeInputSchema.nullable().default(null),
    unit: requiredTextSchema,
    direction: kpiDirectionSchema,
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
    sourceId: idSchema.nullable().default(null),
    followUpOfWeekId: idSchema.nullable().default(null),
    followUpReason: z.string().trim().nullable().default(null),
  })
  .refine((week) => week.endDate === addDays(week.startDate, 6), {
    message: "A plan week must run for exactly 7 days.",
    path: ["endDate"],
  });
export type PlanWeekRequestDto = z.infer<typeof planWeekRequestSchema>;

export const createManualPlanRequestSchema = z.object({
  employeeId: idSchema,
  weeks: z.array(planWeekRequestSchema).default([]),
});
export type CreateManualPlanRequestDto = z.infer<
  typeof createManualPlanRequestSchema
>;

/** "Exclude Failed Indicator?" */
export const excludeIndicatorRequestSchema = z.object({
  sourceId: idSchema,
  exclusionReason: requiredTextSchema,
});
export type ExcludeIndicatorRequestDto = z.infer<
  typeof excludeIndicatorRequestSchema
>;

/** Employee weekly update. */
export const submitPlanWeekRequestSchema = z.object({
  progressActual: nonNegativeInputSchema,
  remarks: requiredTextSchema,
});
export type SubmitPlanWeekRequestDto = z.infer<
  typeof submitPlanWeekRequestSchema
>;

/** Manager weekly assessment. A missed week needs a reason. */
export const assessPlanWeekRequestSchema = z
  .object({
    outcome: pipWeekResultSchema,
    verifiedActual: nonNegativeInputSchema.nullable().default(null),
    remarks: requiredTextSchema,
    missedReason: z.string().trim().nullable().default(null),
  })
  .refine(
    (value) => value.outcome !== "missed" || Boolean(value.missedReason),
    {
      message: "Explain why the week was missed.",
      path: ["missedReason"],
    },
  );
export type AssessPlanWeekRequestDto = z.infer<
  typeof assessPlanWeekRequestSchema
>;

export const closePlanRequestSchema = z.object({
  outcome: pipCloseOutcomeSchema,
  completionNote: requiredTextSchema,
});
export type ClosePlanRequestDto = z.infer<typeof closePlanRequestSchema>;

export const cancelPlanRequestSchema = z.object({
  cancelReason: requiredTextSchema,
});
export type CancelPlanRequestDto = z.infer<typeof cancelPlanRequestSchema>;
