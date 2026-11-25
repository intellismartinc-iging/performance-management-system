import type { GoalTemplateDetailResponseDto } from "@pms/shared-types";
import { describe, expect, it } from "vitest";
import { fromGoalTemplateDetail, stateKey } from "@/features/review-templates/services/goal-template-editor-state";
import { toSaveGoalTemplateRequest } from "@/features/review-templates/services/template-requests";

const ID = (suffix: string) => `3f2504e0-4f89-41d3-9a0c-0305e82c33${suffix}`;
const INDICATOR_ID = ID("03");

function detail(overrides: Partial<GoalTemplateDetailResponseDto> = {}): GoalTemplateDetailResponseDto {
  return {
    template: {
      templateId: ID("01"),
      position: "Software Engineer",
      company: "Mayon Consolidated Inc.",
      name: "Engineering Manager Performance Goals",
      description: "Position targets",
      status: "published",
      currentVersion: 2,
      publishedBy: null,
      publishedAt: null,
      archivedAt: null,
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-05T00:00:00.000Z",
    },
    version: null,
    indicators: [
      {
        indicatorId: INDICATOR_ID,
        versionId: ID("02"),
        name: "Delivery rate",
        description: null,
        unit: "Percentage",
        target: 90,
        direction: "higher_is_better",
        weight: 100,
        scoreTargetMet: 5,
        scoreBelowTarget: 3.5,
        matrixKind: "none",
        matrixTitle: null,
        scaleBound: null,
        useForScoring: false,
      },
    ],
    scales: [],
    matrixRows: [],
    matrixColumns: [],
    matrixCells: [],
    ...overrides,
  };
}

describe("fromGoalTemplateDetail", () => {
  it("turns a template into the text the editor shows", () => {
    const template = fromGoalTemplateDetail(detail());

    expect(template).toMatchObject({
      name: "Engineering Manager Performance Goals",
      description: "Position targets",
      position: "Software Engineer",
    });
    expect(template.indicators[0]).toMatchObject({
      id: INDICATOR_ID,
      name: "Delivery rate",
      description: "",
      unit: "Percentage",
      direction: "higher_is_better",
      target: "90",
      weight: "100",
      scoreMet: "5",
      scoreBelow: "3.5",
      matrix: { kind: "none" },
    });
  });

  it("leaves a missing name, description, position, unit, and target empty", () => {
    const base = detail();
    const template = fromGoalTemplateDetail({
      ...base,
      template: { ...base.template, name: null, description: null, position: null },
      indicators: [{ ...base.indicators[0]!, unit: null, target: null }],
    });

    expect(template).toMatchObject({ name: "", description: "", position: "" });
    expect(template.indicators[0]).toMatchObject({ unit: "", target: "" });
  });

  it("reads a minimum scale: the threshold is the lower bound, and the scale may score", () => {
    const base = detail();
    const scale = (scaleId: string, lowerBound: number, label: string, score: number) => ({
      scaleId,
      indicatorId: INDICATOR_ID,
      lowerBound,
      upperBound: null,
      label,
      score,
    });
    const template = fromGoalTemplateDetail({
      ...base,
      indicators: [
        { ...base.indicators[0]!, matrixKind: "scale", matrixTitle: "Thresholds", scaleBound: "minimum", useForScoring: true },
      ],
      scales: [scale(ID("11"), 0, "Below", 1), scale(ID("12"), 90, "Met", 5)],
    });

    expect(template.indicators[0]?.matrix).toEqual({
      kind: "scale",
      title: "Thresholds",
      bound: "minimum",
      scoring: true,
      scaleRows: [
        { threshold: "0", label: "Below", score: "1" },
        { threshold: "90", label: "Met", score: "5" },
      ],
      columns: [],
      rows: [],
    });
  });

  it("reads a maximum scale: the threshold is the upper bound, and the final row has none", () => {
    const base = detail();
    const template = fromGoalTemplateDetail({
      ...base,
      indicators: [
        { ...base.indicators[0]!, matrixKind: "scale", matrixTitle: "Defects", scaleBound: "maximum", useForScoring: false },
      ],
      scales: [
        { scaleId: ID("11"), indicatorId: INDICATOR_ID, lowerBound: null, upperBound: 1, label: "Met", score: 5 },
        { scaleId: ID("12"), indicatorId: INDICATOR_ID, lowerBound: null, upperBound: null, label: "Above", score: 2 },
      ],
    });

    expect(template.indicators[0]?.matrix.scaleRows).toEqual([
      { threshold: "1", label: "Met", score: "5" },
      { threshold: null, label: "Above", score: "2" },
    ]);
  });

  it("reads a reference table in position order, with a cell for each row and column", () => {
    const base = detail();
    const column = (colId: string, colLabel: string, position: number) => ({
      colId,
      indicatorId: INDICATOR_ID,
      colLabel,
      position,
    });
    const row = (rowId: string, position: number) => ({
      rowId,
      indicatorId: INDICATOR_ID,
      rowLabel: null,
      position,
    });
    const template = fromGoalTemplateDetail({
      ...base,
      indicators: [{ ...base.indicators[0]!, matrixKind: "table", matrixTitle: "Reference matrix" }],
      // The rows arrive out of order, and one cell is missing.
      matrixColumns: [column(ID("22"), "Guidance", 1), column(ID("21"), "Criteria", 0)],
      matrixRows: [row(ID("32"), 1), row(ID("31"), 0)],
      matrixCells: [
        { rowId: ID("31"), colId: ID("21"), value: "Quality" },
        { rowId: ID("31"), colId: ID("22"), value: "No defects" },
        { rowId: ID("32"), colId: ID("21"), value: "Speed" },
      ],
    });

    expect(template.indicators[0]?.matrix).toMatchObject({
      kind: "table",
      title: "Reference matrix",
      columns: ["Criteria", "Guidance"],
      rows: [
        ["Quality", "No defects"],
        ["Speed", ""],
      ],
    });
  });

  it("ignores the matrix rows of another indicator", () => {
    const base = detail();
    const template = fromGoalTemplateDetail({
      ...base,
      scales: [
        { scaleId: ID("11"), indicatorId: ID("99"), lowerBound: 0, upperBound: null, label: "Other", score: 1 },
      ],
    });

    expect(template.indicators[0]?.matrix.scaleRows).toEqual([]);
  });
});

describe("saving an edited template", () => {
  it("sends the id of an existing indicator, and none for a new one", () => {
    const template = fromGoalTemplateDetail(detail());
    template.indicators.push({ ...template.indicators[0]!, id: "indicator-2", name: "New one", weight: "0.01" });

    const result = toSaveGoalTemplateRequest(template, { keepIds: true });

    expect(result.data?.indicators.map((indicator) => indicator.indicatorId)).toEqual([
      INDICATOR_ID,
      undefined,
    ]);
  });

  it("sends no ids when the template is copied", () => {
    const template = fromGoalTemplateDetail(detail());

    const result = toSaveGoalTemplateRequest(template);

    expect(result.data?.indicators[0]?.indicatorId).toBeUndefined();
  });
});

describe("stateKey", () => {
  it("changes when the template is saved, so a stale message or draft is dropped", () => {
    const base = detail();
    const saved = detail({ template: { ...base.template, updatedAt: "2026-11-06T00:00:00.000Z" } });

    expect(stateKey(saved)).not.toBe(stateKey(base));
    expect(stateKey(detail())).toBe(stateKey(base));
  });
});
