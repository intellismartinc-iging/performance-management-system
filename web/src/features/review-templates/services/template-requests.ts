import {
  idSchema,
  saveBehavioralTemplateRequestSchema,
  saveGoalTemplateRequestSchema,
} from "@pms/shared-types";

import type { BehavioralTemplate } from "@/features/review-templates/components/behavioral-template-editor";
import type { KpiGoalTemplate } from "@/features/review-templates/components/kpi-goal-template-editor";
import { toMatrixInput } from "@/features/review-templates/services/indicator-matrix";

/**
 * Editor drafts to API request bodies. Use `safeParse` results: a draft can be
 * incomplete, and the caller decides what to show. The behavioral template
 * tables still have no name or description column, so that editor does not send them.
 */

export function toSaveBehavioralTemplateRequest(template: BehavioralTemplate) {
  return saveBehavioralTemplateRequestSchema.safeParse({
    sections: template.sections.map((section) => ({
      title: section.name,
      questions: section.questions.map((question) => ({
        prompt: question.title,
        questionType: question.type,
        isRequired: question.required,
        canMarkNotObserved: question.type === "rating_scale" ? false : null,
        choices:
          question.type === "multiple_choice"
            ? question.choices
                .split(/\r?\n/)
                .map((choice) => choice.trim())
                .filter(Boolean)
            : [],
      })),
    })),
  });
}

/** `template.position` is the id of a position, as a string from the select. */
export function toSaveGoalTemplateRequest(
  template: KpiGoalTemplate,
  options: { keepIds?: boolean } = {},
) {
  const positionId = Number(template.position);
  return saveGoalTemplateRequestSchema.safeParse({
    name: template.name,
    description: template.description,
    positionId: Number.isInteger(positionId) ? positionId : null,
    indicators: template.indicators.map((indicator) => ({
      // Only an indicator that came from the server has a real id: a new one is "indicator-2".
      indicatorId:
        options.keepIds && idSchema.safeParse(indicator.id).success ? indicator.id : undefined,
      name: indicator.name,
      description: indicator.description,
      unit: indicator.unit,
      direction: indicator.direction,
      target: Number(indicator.target),
      weight: Number(indicator.weight),
      scoreTargetMet: Number(indicator.scoreMet),
      scoreBelowTarget: Number(indicator.scoreBelow),
      // The matrix, its rows, and whether it scores: the same shape the API checks.
      ...toMatrixInput(indicator),
    })),
  });
}
