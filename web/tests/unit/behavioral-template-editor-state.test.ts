import type { BehavioralTemplateTreeResponseDto } from "@pms/shared-types";
import { describe, expect, it } from "vitest";
import { fromBehavioralTemplateTree } from "@/features/review-templates/services/behavioral-template-editor-state";

const id = (n: number) => `3f2504e0-4f89-41d3-9a0c-0305e82c33${String(n).padStart(2, "0")}`;

const TREE: BehavioralTemplateTreeResponseDto = {
  template: {
    templateId: id(1),
    company: "Mayon Consolidated Inc.",
    name: "Quarterly Performance Review",
    description: "Reflect on behaviors.",
    category: "peer_feedback",
    reviewType: "hr",
    status: "draft",
    currentVersion: 1,
    publishedBy: null,
    publishedAt: null,
    archivedAt: null,
    createdAt: "2026-11-24T06:00:00.000Z",
    updatedAt: "2026-11-24T06:00:00.000Z",
  },
  version: { versionId: id(2), templateId: id(1), version: 1, frozenAt: null, createdBy: null, createdAt: "2026-11-24T06:00:00.000Z" },
  // The API sends the lists flat and in no promised order.
  sections: [
    { sectionId: id(11), versionId: id(2), title: "Teamwork", sortOrder: 1 },
    { sectionId: id(10), versionId: id(2), title: "Job Performance", sortOrder: 0 },
  ],
  questions: [
    { questionId: id(22), sectionId: id(10), prompt: "Second", questionType: "short_answer", isRequired: false, allowNotObserved: null, sortOrder: 1 },
    { questionId: id(21), sectionId: id(10), prompt: "First", questionType: "rating_scale", isRequired: true, allowNotObserved: true, sortOrder: 0 },
    { questionId: id(23), sectionId: id(11), prompt: "Pick one", questionType: "multiple_choice", isRequired: true, allowNotObserved: null, sortOrder: 0 },
  ],
  options: [
    { optionId: id(31), questionId: id(23), label: "Daily" },
    { optionId: id(32), questionId: id(23), label: "Weekly" },
  ],
};

describe("fromBehavioralTemplateTree", () => {
  it("turns the API tree into the text the builder shows, in section and question order", () => {
    const template = fromBehavioralTemplateTree(TREE);

    expect(template).toMatchObject({
      name: "Quarterly Performance Review",
      description: "Reflect on behaviors.",
      category: "peer_feedback",
      reviewType: "hr",
    });
    expect(template.sections.map((section) => section.name)).toEqual(["Job Performance", "Teamwork"]);
    expect(template.sections[0]!.questions.map((question) => question.title)).toEqual(["First", "Second"]);
    expect(template.sections[0]!.questions[0]).toMatchObject({ type: "rating_scale", required: true, notObserved: true, choices: [] });
    expect(template.sections[0]!.questions[1]).toMatchObject({ type: "short_answer", required: false, notObserved: false });
  });

  it("gives a multiple choice question its options as separate entries", () => {
    const question = fromBehavioralTemplateTree(TREE).sections[1]!.questions[0]!;

    expect(question).toMatchObject({ type: "multiple_choice", choices: ["Daily", "Weekly"] });
  });

  it("uses the ids of the API as the keys, and keeps a missing flag false", () => {
    const template = fromBehavioralTemplateTree(TREE);

    expect(template.sections[0]!.id).toBe(id(10));
    expect(template.sections[0]!.questions[0]!.id).toBe(id(21));
  });

  it("reads a template made before the detail columns as empty text and Others", () => {
    const template = fromBehavioralTemplateTree({
      ...TREE,
      template: { ...TREE.template, name: null, description: null, category: null, reviewType: null },
    });

    expect(template).toMatchObject({ name: "", description: "", category: "others", reviewType: "others" });
  });
});
