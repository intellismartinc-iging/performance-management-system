import { describe, expect, it } from "vitest";
import type { KpiGoalTemplate } from "@/features/review-templates/components/kpi-goal-template-editor";
import { noMatrix } from "@/features/review-templates/services/indicator-matrix";
import { toSaveGoalTemplateRequest } from "@/features/review-templates/services/template-requests";

const TEMPLATE: KpiGoalTemplate = {
  name: "  Software Engineer Performance Goals ",
  description: " Position targets ",
  position: "12",
  indicators: [
    {
      id: "indicator-1",
      name: "Delivery rate",
      description: "",
      unit: "Percentage",
      direction: "higher_is_better",
      target: "90",
      weight: "100",
      scoreMet: "5",
      scoreBelow: "3.5",
      matrix: noMatrix(),
    },
  ],
};

describe("toSaveGoalTemplateRequest", () => {
  it("sends the template name and description with the position and indicators", () => {
    const result = toSaveGoalTemplateRequest(TEMPLATE);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name: "Software Engineer Performance Goals",
      description: "Position targets",
      positionId: 12,
    });
    expect(result.data?.indicators[0]).toMatchObject({ scoreBelowTarget: 3.5 });
  });

  it("reports a missing name instead of sending the draft", () => {
    const result = toSaveGoalTemplateRequest({ ...TEMPLATE, name: "   " });

    expect(result.success).toBe(false);
  });
});
