import type { KpiDirection } from "../domain/kpi-direction.enum.js";
import type { MatrixKind } from "../domain/matrix-kind.enum.js";
import type { ScaleBound } from "../domain/scale-bound.enum.js";

/**
 * The matrix rules of a KPI indicator (Tpl-G-004 and Tpl-G-005), written once for
 * the API, the save schema, and the editor, so a body the editor accepts is a body
 * the API accepts. They follow the legacy builder.
 *
 * A scale row is one threshold. On a `minimum` scale `lowerBound` is the minimum
 * actual (inclusive) and `upperBound` is null. On a `maximum` scale `upperBound`
 * is the maximum actual (inclusive), `lowerBound` is null, and the final row has no
 * upper limit, so its `upperBound` is null too. Rows are in threshold order.
 */
export interface ScaleRowInput {
  lowerBound: number | null;
  upperBound: number | null;
  label: string;
  score: number;
}

export interface IndicatorMatrixInput {
  matrixKind: MatrixKind;
  matrixTitle: string | null;
  scaleBound: ScaleBound | null;
  useForScoring: boolean;
  scales: ScaleRowInput[];
  matrixColumns: { label: string }[];
  matrixRows: { cells: string[] }[];
}

/** The sizes are capped because the matrix comes from outside. */
export const MATRIX_LIMITS = {
  titleLength: 120,
  labelLength: 100,
  cellLength: 500,
  scaleRows: 20,
  tableColumns: 10,
  tableRows: 50,
} as const;

export const SCORING_ONLY_ON_SCALE =
  "Only numeric threshold scales can be used for scoring.";

/** A number with at most two decimals, as `numeric(3,2)` stores it. Compares with a tolerance: 3.35 * 100 is not exactly 335. */
export function hasAtMostTwoDecimals(value: number): boolean {
  return (
    Number.isFinite(value) &&
    Math.abs(value * 100 - Math.round(value * 100)) < 1e-9
  );
}

/** A score from 1 to 5 with at most two decimals. */
export function isValidIndicatorScore(score: number): boolean {
  return score >= 1 && score <= 5 && hasAtMostTwoDecimals(score);
}

const isBlank = (text: string) => text.trim() === "";
const isThreshold = (value: number | null): value is number =>
  value !== null && Number.isFinite(value) && value >= 0;

/** The problems of the rows of a scale, in the words of the legacy builder. */
function scaleRowErrors(
  bound: ScaleBound,
  scales: readonly ScaleRowInput[],
): string[] {
  if (scales.length === 0)
    return [bound === "maximum" ? MAXIMUM_MESSAGE : MINIMUM_MESSAGE];
  if (scales.length > MATRIX_LIMITS.scaleRows) {
    return [`Use at most ${MATRIX_LIMITS.scaleRows} scale rows.`];
  }

  const isMaximum = bound === "maximum";
  const invalid = scales.some((row, index) => {
    const own = isMaximum ? row.upperBound : row.lowerBound;
    const other = isMaximum ? row.lowerBound : row.upperBound;
    const previous = index > 0 ? scales[index - 1] : undefined;
    const before =
      previous && (isMaximum ? previous.upperBound : previous.lowerBound);
    const isFinal = index === scales.length - 1;

    if (isBlank(row.label) || row.label.length > MATRIX_LIMITS.labelLength)
      return true;
    if (!isValidIndicatorScore(row.score)) return true;
    if (other !== null) return true;
    if (isMaximum && isFinal) return own !== null;
    if (!isThreshold(own)) return true;
    if (!isMaximum && index === 0) return own !== 0;
    return typeof before === "number" && own <= before;
  });
  return invalid ? [isMaximum ? MAXIMUM_MESSAGE : MINIMUM_MESSAGE] : [];
}

const MAXIMUM_MESSAGE =
  "Scale rows need labels, scores from 1 to 5, distinct increasing nonnegative maximums, and a final row with no upper limit.";
const MINIMUM_MESSAGE =
  "Scale rows need a label, a score from 1 to 5, and distinct increasing nonnegative minimums starting at 0.";

function tableErrors(matrix: IndicatorMatrixInput): string[] {
  const { matrixColumns: columns, matrixRows: rows } = matrix;
  if (columns.length > MATRIX_LIMITS.tableColumns) {
    return [`Use at most ${MATRIX_LIMITS.tableColumns} columns.`];
  }
  if (rows.length > MATRIX_LIMITS.tableRows) {
    return [`Use at most ${MATRIX_LIMITS.tableRows} rows.`];
  }
  const complete =
    columns.length > 0 &&
    rows.length > 0 &&
    columns.every(
      (column) =>
        !isBlank(column.label) &&
        column.label.length <= MATRIX_LIMITS.labelLength,
    ) &&
    rows.every(
      (row) =>
        row.cells.length === columns.length &&
        row.cells.every((cell) => cell.length <= MATRIX_LIMITS.cellLength),
    );
  return complete
    ? []
    : ["Add labeled columns and at least one complete table row."];
}

/** Every problem with the matrix of one indicator. An empty list means it is valid. */
export function indicatorMatrixErrors(matrix: IndicatorMatrixInput): string[] {
  const errors: string[] = [];
  const hasDetails =
    matrix.scales.length > 0 ||
    matrix.matrixColumns.length > 0 ||
    matrix.matrixRows.length > 0;

  if (matrix.matrixKind === "none") {
    if (
      hasDetails ||
      matrix.scaleBound ||
      (matrix.matrixTitle ?? "").trim() !== ""
    ) {
      errors.push("Choose a matrix type before adding matrix details.");
    }
    if (matrix.useForScoring) errors.push(SCORING_ONLY_ON_SCALE);
    return errors;
  }

  const title = (matrix.matrixTitle ?? "").trim();
  if (title === "") errors.push("Enter a matrix title.");
  else if (title.length > MATRIX_LIMITS.titleLength) {
    errors.push(
      `Use at most ${MATRIX_LIMITS.titleLength} characters for the matrix title.`,
    );
  }

  if (matrix.matrixKind === "table") {
    if (matrix.scaleBound || matrix.scales.length > 0) {
      errors.push("A reference table has no scale rows.");
    }
    errors.push(...tableErrors(matrix));
    if (matrix.useForScoring) errors.push(SCORING_ONLY_ON_SCALE);
    return errors;
  }

  if (matrix.matrixColumns.length > 0 || matrix.matrixRows.length > 0) {
    errors.push("A scale has no table rows or columns.");
  }
  if (matrix.scaleBound !== "minimum" && matrix.scaleBound !== "maximum") {
    errors.push("Choose minimum or maximum thresholds.");
    return errors;
  }
  errors.push(...scaleRowErrors(matrix.scaleBound, matrix.scales));
  return errors;
}

/** The scale rows the legacy builder starts with, for a threshold type and a target. */
export function defaultScale(
  bound: ScaleBound,
  target: number,
): ScaleRowInput[] {
  if (bound === "maximum") {
    return [
      { lowerBound: null, upperBound: target, label: "Target met", score: 5 },
      { lowerBound: null, upperBound: null, label: "Below target", score: 1 },
    ];
  }
  return target === 0
    ? [{ lowerBound: 0, upperBound: null, label: "Target met", score: 5 }]
    : [
        { lowerBound: 0, upperBound: null, label: "Below target", score: 1 },
        { lowerBound: target, upperBound: null, label: "Target met", score: 5 },
      ];
}

/**
 * The score a scale gives an actual result: on a minimum scale the last row whose
 * minimum is at or below the actual, on a maximum scale the first row whose maximum
 * is at or above it. Null for an invalid scale or a negative actual.
 */
export function scaleScore(
  matrix: Pick<IndicatorMatrixInput, "scaleBound" | "scales">,
  actual: number,
): number | null {
  const { scaleBound: bound, scales } = matrix;
  if (bound !== "minimum" && bound !== "maximum") return null;
  if (!Number.isFinite(actual) || actual < 0) return null;
  if (scaleRowErrors(bound, scales).length > 0) return null;

  if (bound === "maximum") {
    return (
      scales.find((row) => row.upperBound === null || actual <= row.upperBound)
        ?.score ?? null
    );
  }
  return (
    scales
      .filter((row) => row.lowerBound !== null && actual >= row.lowerBound)
      .at(-1)?.score ?? null
  );
}

/**
 * The actual results to try against a scale: zero, just below the target, the
 * target, and just above it. A zero target gives a negative "just below" sample,
 * which no actual result can have.
 */
export function scaleBoundarySamples(
  target: number,
): { label: string; actual: number }[] {
  const step = Math.max(Math.abs(target) * 0.000001, 0.000001);
  return [
    { label: "Zero", actual: 0 },
    { label: "Below target", actual: target - step },
    { label: "Exact target", actual: target },
    { label: "Above target", actual: target + step },
  ];
}

/** True when a row scores against the direction: lower than the row before it for "higher is better". */
export function scaleDirectionConflicts(
  direction: KpiDirection,
  scales: readonly { score: number }[],
): boolean {
  return scales.some((row, index) => {
    const previous = scales[index - 1];
    if (!previous) return false;
    return direction === "lower_is_better"
      ? row.score > previous.score
      : row.score < previous.score;
  });
}
