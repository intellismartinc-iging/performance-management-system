import { z } from "zod";
import { kpiDirectionSchema } from "../domain/kpi-direction.enum.js";
import {
  bigintIdSchema,
  nonNegativeInputSchema,
  requiredTextSchema,
} from "../common.js";
import {
  kpiGoalTemplatesRowSchema,
  kpiIndicatorMatrixColumnsRowSchema,
  kpiIndicatorMatrixRowsRowSchema,
  kpiIndicatorScalesRowSchema,
  kpiIndicatorsRowSchema,
  kpiTemplateVersionsRowSchema,
} from "../rows/index.js";

export const goalTemplateDtoSchema = kpiGoalTemplatesRowSchema;
export type GoalTemplateDto = z.infer<typeof goalTemplateDtoSchema>;

export const indicatorDtoSchema = kpiIndicatorsRowSchema.extend({
  /** ASSUMPTION: the API embeds scales and the reference matrix on an indicator. */
  scales: z.array(kpiIndicatorScalesRowSchema).optional(),
  matrixRows: z.array(kpiIndicatorMatrixRowsRowSchema).optional(),
  matrixColumns: z.array(kpiIndicatorMatrixColumnsRowSchema).optional(),
});
export type IndicatorDto = z.infer<typeof indicatorDtoSchema>;

export const goalTemplateVersionDtoSchema = kpiTemplateVersionsRowSchema.extend(
  {
    /** ASSUMPTION: the API embeds indicators on a version. */
    indicators: z.array(indicatorDtoSchema).optional(),
  },
);
export type GoalTemplateVersionDto = z.infer<
  typeof goalTemplateVersionDtoSchema
>;

/** One row of the KPI Goal Template editor, as sent to the API. */
const indicatorRequestSchema = z.object({
  name: requiredTextSchema,
  description: z.string().trim().default(""),
  unit: requiredTextSchema,
  direction: kpiDirectionSchema,
  target: nonNegativeInputSchema,
  weight: z.number().gt(0).max(100),
  scoreTargetMet: z.number().int().min(1).max(5).default(5),
  scoreBelowTarget: z.number().int().min(1).max(5).default(2),
  isUsedForScoring: z.boolean().default(true),
});

/**
 * pms.kpi_goal_templates has a position and no name or description column, so
 * the name and description in the editor are not sent.
 */
export const saveGoalTemplateRequestSchema = z.object({
  positionId: bigintIdSchema.nullable(),
  indicators: z
    .array(indicatorRequestSchema)
    .min(1, "Add at least one indicator."),
});
export type SaveGoalTemplateRequestDto = z.infer<
  typeof saveGoalTemplateRequestSchema
>;
