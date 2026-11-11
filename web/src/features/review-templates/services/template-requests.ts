import {
  saveBehavioralTemplateRequestSchema,
  saveGoalTemplateRequestSchema,
} from "@pms/shared-types";

import type { BehavioralTemplate } from "@/features/review-templates/components/behavioral-template-editor";
import type { KpiGoalTemplate } from "@/features/review-templates/components/kpi-goal-template-editor";

/**
 * Editor drafts to API request bodies. The database tables have no name or
 * description column for templates, so those two editor fields are not sent.
 * Use `safeParse` results: a draft can be incomplete, and the caller decides
 * what to show.
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
export function toSaveGoalTemplateRequest(template: KpiGoalTemplate) {
  const positionId = Number(template.position);
  return saveGoalTemplateRequestSchema.safeParse({
    positionId: Number.isInteger(positionId) ? positionId : null,
    indicators: template.indicators.map((indicator) => ({
      name: indicator.name,
      description: indicator.description,
      unit: indicator.unit,
      direction: indicator.direction,
      target: Number(indicator.target),
      weight: Number(indicator.weight),
      scoreTargetMet: Number(indicator.scoreMet),
      scoreBelowTarget: Number(indicator.scoreBelow),
      isUsedForScoring: true,
    })),
  });
}
