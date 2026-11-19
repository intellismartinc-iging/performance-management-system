import { saveGoalTemplateRequestSchema } from "@pms/shared-types";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { CreateKpiGoalTemplateDto } from "./create-kpi-goal-template.dto.js";
import { UpdateKpiGoalTemplateDto } from "./update-kpi-goal-template.dto.js";

// Validate the way main.ts does, so a key the DTO lacks fails here too.
const PIPE_OPTIONS = { whitelist: true, forbidNonWhitelisted: true } as const;

const NAME = "Software Engineer Performance Goals";

const indicator = {
  name: "Sales",
  description: "",
  unit: "PHP",
  direction: "higher_is_better",
  target: 0,
  weight: 100,
  scoreTargetMet: 5,
  scoreBelowTarget: 2,
};

async function errorsOf<T extends object>(
  type: new () => T,
  body: unknown,
): Promise<string[]> {
  const errors = await validate(plainToInstance(type, body) as object, PIPE_OPTIONS);
  return errors.map((error) => error.property);
}

describe("KPI goal template request contract", () => {
  it.each([
    ["create", CreateKpiGoalTemplateDto],
    ["update", UpdateKpiGoalTemplateDto],
  ])("accepts the body the shared save schema produces on %s", async (_route, type) => {
    const body = saveGoalTemplateRequestSchema.parse({
      name: NAME,
      positionId: 7,
      indicators: [indicator],
    });

    expect(await errorsOf(type, body)).toEqual([]);
  });

  it.each([null, undefined])("accepts a company-wide template (position %s)", async (positionId) => {
    const body = { name: NAME, positionId, indicators: [indicator] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toEqual([]);
  });

  it.each([
    ["create", CreateKpiGoalTemplateDto],
    ["update", UpdateKpiGoalTemplateDto],
  ])("rejects a client-sent companyId on %s: the server sets it", async (_route, type) => {
    const body = { name: NAME, companyId: 3, positionId: 7, indicators: [indicator] };

    expect(await errorsOf(type, body)).toContain("companyId");
  });

  it("accepts a name and a description, and trims the name", async () => {
    const body = { name: "  " + NAME + " ", description: "Position targets", positionId: 7, indicators: [indicator] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toEqual([]);
  });

  it.each([undefined, "", "   ", "x".repeat(121), 7])("rejects the name %j", async (name) => {
    const body = { name, positionId: 7, indicators: [indicator] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toContain("name");
  });

  it("rejects a description over 2000 characters", async () => {
    const body = { name: NAME, description: "x".repeat(2001), positionId: 7, indicators: [indicator] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toContain("description");
  });

  it("accepts a score with up to two decimals", async () => {
    const body = {
      name: NAME,
      positionId: 7,
      indicators: [{ ...indicator, scoreBelowTarget: 3.5 }, { ...indicator, scoreBelowTarget: 3.25 }],
    };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toEqual([]);
  });

  it.each([3.555, 5.5, 0.5, 0])("rejects the score %s", async (score) => {
    const body = { name: NAME, positionId: 7, indicators: [{ ...indicator, scoreBelowTarget: score }] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toContain("indicators");
  });

  it("accepts the matrix the shared save schema produces: a scale and a table", async () => {
    const scale = {
      ...indicator,
      matrixKind: "scale",
      matrixTitle: "Numeric threshold scale",
      scaleBound: "minimum",
      useForScoring: true,
      scales: [
        { lowerBound: 0, upperBound: null, label: "Below target", score: 1 },
        { lowerBound: 90, upperBound: null, label: "Target met", score: 3.5 },
      ],
    };
    const table = {
      ...indicator,
      matrixKind: "table",
      matrixTitle: "Reference matrix",
      matrixColumns: [{ label: "Criteria" }, { label: "Guidance" }],
      matrixRows: [{ cells: ["Quality", "No defects"] }],
    };
    const body = saveGoalTemplateRequestSchema.parse({
      name: NAME,
      positionId: 7,
      indicators: [scale, table],
    });

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toEqual([]);
  });

  it.each([
    ["an unknown matrix kind", { matrixKind: "grid" }],
    ["an unknown threshold type", { matrixKind: "scale", scaleBound: "middle" }],
    [
      "a scale row with the old row key",
      { matrixKind: "scale", scales: [{ lowerBound: 0, rowLabel: "x", label: "a", score: 1 }] },
    ],
    [
      "a scale score with three decimals",
      { matrixKind: "scale", scales: [{ lowerBound: 0, upperBound: null, label: "a", score: 3.555 }] },
    ],
    [
      "a table cell that is not text",
      { matrixKind: "table", matrixColumns: [{ label: "A" }], matrixRows: [{ cells: [7] }] },
    ],
    [
      "too many scale rows",
      {
        matrixKind: "scale",
        scales: Array.from({ length: 21 }, (_, index) => ({
          lowerBound: index,
          upperBound: null,
          label: "a",
          score: 1,
        })),
      },
    ],
  ])("rejects %s", async (_label, matrix) => {
    const body = { name: NAME, positionId: 7, indicators: [{ ...indicator, ...matrix }] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toContain("indicators");
  });

  it("accepts the id of an existing indicator, and only a uuid", async () => {
    const withId = (indicatorId: string) => ({
      name: NAME,
      positionId: 7,
      indicators: [{ ...indicator, indicatorId }],
    });

    expect(
      await errorsOf(UpdateKpiGoalTemplateDto, withId("3f2504e0-4f89-41d3-9a0c-0305e82c3303")),
    ).toEqual([]);
    expect(await errorsOf(UpdateKpiGoalTemplateDto, withId("indicator-1"))).toContain("indicators");
  });

  it("rejects a nested indicator with a score above 5 on update", async () => {
    const body = { name: NAME, positionId: 7, indicators: [{ ...indicator, scoreTargetMet: 9 }] };

    expect(await errorsOf(UpdateKpiGoalTemplateDto, body)).toContain("indicators");
  });

  it.each([0, -1, 1.5, "abc", "7"])("rejects positionId %j", async (positionId) => {
    const body = { name: NAME, positionId, indicators: [indicator] };

    expect(await errorsOf(CreateKpiGoalTemplateDto, body)).toContain("positionId");
  });
});
