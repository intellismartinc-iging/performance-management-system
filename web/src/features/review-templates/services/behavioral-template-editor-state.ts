import type { BehavioralTemplateTreeResponseDto } from "@pms/shared-types";

import type {
  BehavioralTemplate,
  Question,
  Section,
} from "@/features/review-templates/components/behavioral-template-editor";

/**
 * The API tree to the text the builder shows. The API sends the sections,
 * questions, and options as flat lists, so this groups them under their parent
 * and orders the sections and the questions by their sort order. A template made
 * before the detail columns existed has no name, description, category, or review
 * type: they read as empty text and Others.
 */
export function fromBehavioralTemplateTree(tree: BehavioralTemplateTreeResponseDto): BehavioralTemplate {
  const sections: Section[] = [...tree.sections]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section) => ({
      id: section.sectionId,
      name: section.title,
      questions: tree.questions
        .filter((question) => question.sectionId === section.sectionId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((question): Question => ({
          id: question.questionId,
          title: question.prompt,
          type: question.questionType,
          choices: tree.options
            .filter((option) => option.questionId === question.questionId)
            .map((option) => option.label),
          required: question.isRequired,
          notObserved: question.allowNotObserved === true,
        })),
    }));

  return {
    name: tree.template.name ?? "",
    description: tree.template.description ?? "",
    category: tree.template.category ?? "others",
    reviewType: tree.template.reviewType ?? "others",
    sections,
  };
}
