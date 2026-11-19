import { z } from "zod";
import { kpiDirectionSchema } from "../domain/kpi-direction.enum.js";
import { matrixKindSchema } from "../domain/matrix-kind.enum.js";
import { scaleBoundSchema } from "../domain/scale-bound.enum.js";
import {
  hasAtMostTwoDecimals,
  indicatorMatrixErrors,
} from "../rules/kpi-matrix.js";
import {
  PERCENTAGE_TARGET_MESSAGE,
  targetExceedsUnit,
} from "../rules/kpi-target.js";
import {
  bigintIdSchema,
  idSchema,
  nonNegativeInputSchema,
  requiredTextSchema,
} from "../common.js";
import {
  kpiGoalTemplatesRowSchema,
  kpiIndicatorMatrixCellsRowSchema,
  kpiIndicatorMatrixColumnsRowSchema,
  kpiIndicatorMatrixRowsRowSchema,
  kpiIndicatorScalesRowSchema,
  kpiIndicatorsRowSchema,
  kpiTemplateVersionsRowSchema,
} from "../rows/index.js";

export const goalTemplateDtoSchema = kpiGoalTemplatesRowSchema;
export type GoalTemplateDto = z.infer<typeof goalTemplateDtoSchema>;

/** A score from 1 to 5 with at most two decimals, as the numeric(3,2) column stores it. */
const indicatorScoreSchema = z
  .number()
  .min(1)
  .max(5)
  .refine(hasAtMostTwoDecimals, {
    message: "Use at most two decimal places.",
  });

/** One row of the KPI Goal Template editor, as sent to the API. */
const indicatorRequestSchema = z
  .object({
    /** Set for an indicator that already exists: the edit keeps its identity. */
    indicatorId: idSchema.optional(),
    name: requiredTextSchema,
    description: z.string().trim().default(""),
    unit: requiredTextSchema,
    direction: kpiDirectionSchema,
    target: nonNegativeInputSchema,
    weight: z.number().gt(0).max(100),
    scoreTargetMet: indicatorScoreSchema.default(5),
    scoreBelowTarget: indicatorScoreSchema.default(2),
    /**
     * The matrix of the indicator (Tpl-G-004): none, a custom reference table, or a
     * numeric threshold scale. The rules are in `indicatorMatrixErrors`.
     */
    matrixKind: matrixKindSchema.default("none"),
    matrixTitle: z.string().trim().nullable().default(null),
    scaleBound: scaleBoundSchema.nullable().default(null),
    /** The API names this `useForScoring`, as the DTO and the table column do. True only on a scale. */
    useForScoring: z.boolean().default(false),
    scales: z
      .array(
        z.object({
          lowerBound: z.number().nullable(),
          upperBound: z.number().nullable(),
          label: z.string(),
          score: z.number(),
        }),
      )
      .default([]),
    matrixColumns: z.array(z.object({ label: z.string() })).default([]),
    matrixRows: z.array(z.object({ cells: z.array(z.string()) })).default([]),
  })
  .superRefine((indicator, context) => {
    if (targetExceedsUnit(indicator.unit, indicator.target)) {
      context.addIssue({
        code: "custom",
        message: PERCENTAGE_TARGET_MESSAGE,
        path: ["target"],
      });
    }
    for (const message of indicatorMatrixErrors(indicator)) {
      context.addIssue({ code: "custom", message, path: ["matrixKind"] });
    }
  });

/** The legacy builder limits the name to 120 characters. */
const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

/** The body of POST /kpi-goals/create and /:id/update. */
export const saveGoalTemplateRequestSchema = z.object({
  name: requiredTextSchema.max(
    MAX_NAME_LENGTH,
    `Use at most ${MAX_NAME_LENGTH} characters.`,
  ),
  description: z
    .string()
    .trim()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Use at most ${MAX_DESCRIPTION_LENGTH} characters.`,
    )
    .default(""),
  positionId: bigintIdSchema.nullable(),
  indicators: z
    .array(indicatorRequestSchema)
    .min(1, "Add at least one indicator."),
});

/** GET /kpi-goals/positions: the positions of the caller's company, for the editor. */
export const goalTemplatePositionListResponseSchema = z.array(
  z.object({ positionId: bigintIdSchema, title: z.string() }),
);

/**
 * GET /kpi-goals: each template row, with its position title and the number of
 * indicators in its current version. `count` arrives from the driver as a string.
 */
export const goalTemplateListResponseSchema = z.array(
  goalTemplateDtoSchema.extend({
    positionTitle: z.string().nullable(),
    indicatorCount: z.coerce.number().int().min(0),
  }),
);
export type GoalTemplateListResponseDto = z.infer<
  typeof goalTemplateListResponseSchema
>;

/**
 * An indicator as GET /kpi-goals/:id returns it. The API names the scoring flag
 * `useForScoring`, not `isUsedForScoring`.
 */
const goalTemplateIndicatorResponseSchema = kpiIndicatorsRowSchema
  .omit({ isUsedForScoring: true })
  .extend({ useForScoring: z.boolean() });

/**
 * GET /kpi-goals/:id: the template row and its current version, with a flat list
 * of indicators, scales and matrix labels. Join them by `indicatorId`.
 */
export const goalTemplateDetailResponseSchema = z.object({
  template: goalTemplateDtoSchema,
  version: kpiTemplateVersionsRowSchema.nullable(),
  indicators: z.array(goalTemplateIndicatorResponseSchema),
  scales: z.array(kpiIndicatorScalesRowSchema),
  matrixRows: z.array(kpiIndicatorMatrixRowsRowSchema),
  matrixColumns: z.array(kpiIndicatorMatrixColumnsRowSchema),
  matrixCells: z.array(kpiIndicatorMatrixCellsRowSchema),
});
export type GoalTemplateDetailResponseDto = z.infer<
  typeof goalTemplateDetailResponseSchema
>;
