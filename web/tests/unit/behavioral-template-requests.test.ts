import { describe, expect, it } from "vitest";
import type { BehavioralTemplate } from "@/features/review-templates/components/behavioral-template-editor";
import { toSaveBehavioralTemplateRequest } from "@/features/review-templates/services/template-requests";

const TEMPLATE: BehavioralTemplate = {
  name: " Quarterly Review ",
  description: " Reflect on observable behaviors. ",
  category: "general_performance",
  reviewType: "self",
  sections: [
    {
      id: "s1",
      name: " Leadership ",
      questions: [
        { id: "q1", title: "Meets deadlines?", type: "rating_scale", choices: [], required: true, notObserved: true },
        { id: "q2", title: "Comments", type: "paragraph", choices: ["ignored"], required: false, notObserved: true },
        { id: "q3", title: "Pick one", type: "multiple_choice", choices: ["Yes", " No ", ""], required: true, notObserved: false },
      ],
    },
  ],
};

describe("toSaveBehavioralTemplateRequest", () => {
  it("builds the exact body of the backend: details, sections, questions, and choice options", () => {
    const result = toSaveBehavioralTemplateRequest(TEMPLATE);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "Quarterly Review",
      description: "Reflect on observable behaviors.",
      category: "general_performance",
      reviewType: "self",
      sections: [
        {
          title: "Leadership",
          questions: [
            { prompt: "Meets deadlines?", questionType: "rating_scale", isRequired: true, allowNotObserved: true },
            { prompt: "Comments", questionType: "paragraph", isRequired: false, allowNotObserved: null },
            {
              prompt: "Pick one",
              questionType: "multiple_choice",
              isRequired: true,
              allowNotObserved: null,
              choiceOptions: [{ label: "Yes" }, { label: "No" }],
            },
          ],
        },
      ],
    });
  });

  it("sends Others as a code with no text of its own", () => {
    const result = toSaveBehavioralTemplateRequest({ ...TEMPLATE, category: "others", reviewType: "others" });

    expect(result.data).toMatchObject({ category: "others", reviewType: "others" });
  });

  it.each([
    ["no name", { ...TEMPLATE, name: "  " }],
    ["no section", { ...TEMPLATE, sections: [] }],
    ["a section with no question", { ...TEMPLATE, sections: [{ id: "s", name: "S", questions: [] }] }],
    ["a blank section name", { ...TEMPLATE, sections: [{ id: "s", name: " ", questions: TEMPLATE.sections[0]!.questions }] }],
  ])("is not valid with %s", (_label, template) => {
    expect(toSaveBehavioralTemplateRequest(template).success).toBe(false);
  });

  it("is not valid for a multiple choice question with fewer than two different options", () => {
    const question = { id: "q", title: "Pick", type: "multiple_choice" as const, choices: ["Yes", "yes"], required: true, notObserved: false };

    expect(toSaveBehavioralTemplateRequest({ ...TEMPLATE, sections: [{ id: "s", name: "S", questions: [question] }] }).success).toBe(false);
  });
});
