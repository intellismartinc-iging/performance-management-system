import { describe, expect, it } from "vitest";
import {
  duplicateQuestion,
  moveItem,
  newBehavioralTemplate,
} from "@/features/review-templates/services/behavioral-template-state";

describe("moveItem", () => {
  it("moves an item one step up or down and keeps the other order", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("leaves the list as it is at either end, and does not change the original", () => {
    const list = ["a", "b", "c"];

    expect(moveItem(list, 0, -1)).toEqual(["a", "b", "c"]);
    expect(moveItem(list, 2, 1)).toEqual(["a", "b", "c"]);
    expect(list).toEqual(["a", "b", "c"]);
  });
});

describe("duplicateQuestion", () => {
  const question = {
    id: "q1",
    title: "Meets deadlines?",
    type: "rating_scale" as const,
    choices: ["Yes", "No"],
    required: true,
    notObserved: true,
  };

  it("puts a copy with a new id right after the question", () => {
    const result = duplicateQuestion([question, { ...question, id: "q2", title: "Other" }], "q1");

    expect(result.map((item) => item.title)).toEqual(["Meets deadlines?", "Meets deadlines?", "Other"]);
    expect(result[1]!.id).not.toBe("q1");
    expect(result[1]).toMatchObject({ type: "rating_scale", required: true, notObserved: true, choices: ["Yes", "No"] });
    expect(result[1]!.choices).not.toBe(result[0]!.choices);
  });

  it("leaves the list as it is for an unknown id", () => {
    expect(duplicateQuestion([question], "missing")).toEqual([question]);
  });
});

describe("newBehavioralTemplate", () => {
  it("starts with one section that holds one rating question, and a default category and review type", () => {
    const template = newBehavioralTemplate();

    expect(template).toMatchObject({ name: "", description: "", category: "general_performance", reviewType: "self" });
    expect(template.sections).toHaveLength(1);
    expect(template.sections[0]!.questions).toHaveLength(1);
    expect(template.sections[0]!.questions[0]).toMatchObject({ type: "rating_scale", required: true });
  });
});
