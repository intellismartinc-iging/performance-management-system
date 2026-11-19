import { indicatorMatrixErrors } from "@pms/shared-types";
import { describe, expect, it } from "vitest";
import type { Indicator } from "@/features/review-templates/components/kpi-goal-template-editor";
import {
  addScaleRow,
  addTableColumn,
  addTableRow,
  matrixOfKind,
  matrixWithBound,
  noMatrix,
  removeScaleRow,
  removeTableColumn,
  removeTableRow,
  toMatrixInput,
} from "@/features/review-templates/services/indicator-matrix";
import { toSaveGoalTemplateRequest } from "@/features/review-templates/services/template-requests";

function indicator(overrides: Partial<Indicator> = {}): Indicator {
  return {
    id: "indicator-1",
    name: "Delivery rate",
    description: "",
    unit: "Percentage",
    direction: "higher_is_better",
    target: "90",
    weight: "100",
    scoreMet: "5",
    scoreBelow: "2",
    matrix: noMatrix(),
    ...overrides,
  };
}

describe("matrixOfKind", () => {
  it("starts a scale the way the legacy builder does, by direction and target", () => {
    const higher = matrixOfKind("scale", "higher_is_better", 90);
    expect(higher).toMatchObject({ kind: "scale", bound: "minimum", scoring: false });
    expect(higher.scaleRows).toEqual([
      { threshold: "0", label: "Below target", score: "1" },
      { threshold: "90", label: "Target met", score: "5" },
    ]);

    const lower = matrixOfKind("scale", "lower_is_better", 10);
    expect(lower.bound).toBe("maximum");
    expect(lower.scaleRows).toEqual([
      { threshold: "10", label: "Target met", score: "5" },
      { threshold: null, label: "Below target", score: "1" },
    ]);
  });

  it("starts a reference table with two columns and one empty row", () => {
    expect(matrixOfKind("table", "higher_is_better", 90)).toMatchObject({
      kind: "table",
      columns: ["Criteria", "Guidance"],
      rows: [["", ""]],
      scoring: false,
    });
  });

  it("starts no matrix as nothing", () => {
    expect(matrixOfKind("none", "higher_is_better", 90)).toEqual(noMatrix());
  });

  it("falls back to a zero target for a target that is not a number", () => {
    expect(matrixOfKind("scale", "higher_is_better", Number.NaN).scaleRows).toEqual([
      { threshold: "0", label: "Target met", score: "5" },
    ]);
  });
});

describe("matrixWithBound", () => {
  it("resets the scale rows when the threshold type changes, and keeps the title", () => {
    const scale = { ...matrixOfKind("scale", "higher_is_better", 90), title: "My scale", scoring: true };

    const changed = matrixWithBound(scale, "maximum", 90);

    expect(changed).toMatchObject({ bound: "maximum", title: "My scale", scoring: true });
    expect(changed.scaleRows.at(-1)?.threshold).toBeNull();
  });
});

describe("scale rows", () => {
  it("adds a row at the end of a minimum scale", () => {
    const scale = matrixOfKind("scale", "higher_is_better", 90);

    const added = addScaleRow(scale);

    expect(added.scaleRows).toHaveLength(3);
    expect(added.scaleRows.at(-1)).toEqual({ threshold: "", label: "", score: "" });
  });

  it("adds a row before the unbounded final row of a maximum scale", () => {
    const scale = matrixOfKind("scale", "lower_is_better", 10);

    const added = addScaleRow(scale);

    expect(added.scaleRows).toHaveLength(3);
    expect(added.scaleRows[1]).toEqual({ threshold: "", label: "", score: "" });
    expect(added.scaleRows.at(-1)?.threshold).toBeNull();
  });

  it("removes a row, but never the unbounded final row of a maximum scale", () => {
    const scale = matrixOfKind("scale", "lower_is_better", 10);

    expect(removeScaleRow(scale, 0).scaleRows).toHaveLength(1);
    expect(removeScaleRow(scale, 1).scaleRows).toHaveLength(2);
  });
});

describe("reference table", () => {
  const table = matrixOfKind("table", "higher_is_better", 90);

  it("adds a column with an empty cell in every row", () => {
    const added = addTableColumn(addTableRow(table));

    expect(added.columns).toEqual(["Criteria", "Guidance", "Column 3"]);
    expect(added.rows).toEqual([
      ["", "", ""],
      ["", "", ""],
    ]);
  });

  it("removes a column and its cells", () => {
    const removed = removeTableColumn({ ...table, rows: [["a", "b"]] }, 0);

    expect(removed.columns).toEqual(["Guidance"]);
    expect(removed.rows).toEqual([["b"]]);
  });

  it("adds and removes rows", () => {
    expect(addTableRow(table).rows).toHaveLength(2);
    expect(removeTableRow(addTableRow(table), 0).rows).toHaveLength(1);
  });
});

describe("toMatrixInput", () => {
  it("flattens a minimum scale: the threshold is the lower bound", () => {
    const input = toMatrixInput(indicator({ matrix: matrixOfKind("scale", "higher_is_better", 90) }));

    expect(input).toMatchObject({ matrixKind: "scale", scaleBound: "minimum", useForScoring: false });
    expect(input.scales).toEqual([
      { lowerBound: 0, upperBound: null, label: "Below target", score: 1 },
      { lowerBound: 90, upperBound: null, label: "Target met", score: 5 },
    ]);
    expect(indicatorMatrixErrors(input)).toEqual([]);
  });

  it("flattens a maximum scale: the threshold is the upper bound, and the final row has none", () => {
    const input = toMatrixInput(indicator({ matrix: matrixOfKind("scale", "lower_is_better", 10) }));

    expect(input.scales).toEqual([
      { lowerBound: null, upperBound: 10, label: "Target met", score: 5 },
      { lowerBound: null, upperBound: null, label: "Below target", score: 1 },
    ]);
    expect(indicatorMatrixErrors(input)).toEqual([]);
  });

  it("flattens a reference table, and never scores from it", () => {
    const matrix = { ...matrixOfKind("table", "higher_is_better", 90), scoring: true };

    const input = toMatrixInput(indicator({ matrix }));

    expect(input).toMatchObject({
      matrixKind: "table",
      useForScoring: false,
      matrixColumns: [{ label: "Criteria" }, { label: "Guidance" }],
      matrixRows: [{ cells: ["", ""] }],
    });
  });

  it("keeps a half-typed threshold as an invalid number, so the rules reject it", () => {
    const matrix = matrixOfKind("scale", "higher_is_better", 90);
    matrix.scaleRows[1]!.threshold = "";

    const errors = indicatorMatrixErrors(toMatrixInput(indicator({ matrix })));

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("toSaveGoalTemplateRequest with a matrix", () => {
  const template = (matrix: Indicator["matrix"]) => ({
    name: "Template",
    description: "",
    position: "12",
    indicators: [indicator({ matrix })],
  });

  it("sends the scale and the scoring flag", () => {
    const matrix = { ...matrixOfKind("scale", "higher_is_better", 90), scoring: true };

    const result = toSaveGoalTemplateRequest(template(matrix));

    expect(result.success).toBe(true);
    expect(result.data?.indicators[0]).toMatchObject({
      matrixKind: "scale",
      scaleBound: "minimum",
      useForScoring: true,
      scales: [
        { lowerBound: 0, upperBound: null, label: "Below target", score: 1 },
        { lowerBound: 90, upperBound: null, label: "Target met", score: 5 },
      ],
    });
  });

  it("sends no matrix as reference only", () => {
    const result = toSaveGoalTemplateRequest(template(noMatrix()));

    expect(result.data?.indicators[0]).toMatchObject({
      matrixKind: "none",
      useForScoring: false,
      scales: [],
    });
  });

  it("reports an invalid scale instead of sending it", () => {
    const matrix = matrixOfKind("scale", "higher_is_better", 90);
    matrix.scaleRows[0]!.threshold = "5";

    expect(toSaveGoalTemplateRequest(template(matrix)).success).toBe(false);
  });
});
