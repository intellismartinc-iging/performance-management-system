import { z } from "zod";
import { behavioralQuestionTypeSchema } from "../domain/behavioral-question-type.enum.js";
import { requiredTextSchema } from "../common.js";
import {
  behavioralChoiceOptionsRowSchema,
  behavioralQuestionsRowSchema,
  behavioralSectionsRowSchema,
  behavioralTemplateVersionsRowSchema,
  behavioralTemplatesRowSchema,
} from "../rows/index.js";

export const behavioralTemplateDtoSchema = behavioralTemplatesRowSchema;
export type BehavioralTemplateDto = z.infer<typeof behavioralTemplateDtoSchema>;

export const behavioralQuestionDtoSchema = behavioralQuestionsRowSchema.extend({
  /** Only for the multiple_choice question type. */
  choiceOptions: z.array(behavioralChoiceOptionsRowSchema).optional(),
});
export type BehavioralQuestionDto = z.infer<typeof behavioralQuestionDtoSchema>;

export const behavioralSectionDtoSchema = behavioralSectionsRowSchema.extend({
  questions: z.array(behavioralQuestionDtoSchema).optional(),
});
export type BehavioralSectionDto = z.infer<typeof behavioralSectionDtoSchema>;

export const behavioralTemplateVersionDtoSchema =
  behavioralTemplateVersionsRowSchema.extend({
    /** ASSUMPTION: the API embeds sections, questions, and choices on a version. */
    sections: z.array(behavioralSectionDtoSchema).optional(),
  });
export type BehavioralTemplateVersionDto = z.infer<
  typeof behavioralTemplateVersionDtoSchema
>;

/**
 * Sections, questions, and choices, as pms.behavioral_* stores them. The table
 * has no name or description column, so the name and description in the editor
 * are not sent.
 */
export const saveBehavioralTemplateRequestSchema = z.object({
  sections: z
    .array(
      z.object({
        title: requiredTextSchema,
        questions: z
          .array(
            z.object({
              prompt: requiredTextSchema,
              questionType: behavioralQuestionTypeSchema,
              isRequired: z.boolean(),
              canMarkNotObserved: z.boolean().nullable().default(null),
              choices: z.array(requiredTextSchema).default([]),
            }),
          )
          .min(1, "Add at least one question."),
      }),
    )
    .min(1, "Add at least one section."),
});
export type SaveBehavioralTemplateRequestDto = z.infer<
  typeof saveBehavioralTemplateRequestSchema
>;
