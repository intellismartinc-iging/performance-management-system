import {
  defaultScale,
  type IndicatorMatrixInput,
  type KpiDirection,
  type MatrixKind,
  type ScaleBound,
} from "@pms/shared-types";

/**
 * The matrix of one indicator in the editor: no matrix, a custom reference table,
 * or a numeric threshold scale. The editor keeps what the user types as text.
 * `toMatrixInput` turns it into the shape of the shared rules, which the API uses
 * too, so a matrix the editor accepts is a matrix the API accepts.
 */
export interface IndicatorMatrix {
  kind: MatrixKind;
  title: string;
  /** A scale only. */
  bound: ScaleBound;
  /** True: the scale sets the score. A scale only. */
  scoring: boolean;
  /**
   * A scale only. `threshold` is the minimum actual on a minimum scale and the maximum
   * actual on a maximum scale. The final row of a maximum scale has none (null).
   */
  scaleRows: { threshold: string | null; label: string; score: string }[];
  /** A reference table only. */
  columns: string[];
  rows: string[][];
}

export function noMatrix(): IndicatorMatrix {
  return {
    kind: "none",
    title: "",
    bound: "minimum",
    scoring: false,
    scaleRows: [],
    columns: [],
    rows: [],
  };
}

/** A target the user has not typed yet is treated as zero, as the legacy builder does. */
function safeTarget(target: number): number {
  return Number.isFinite(target) && target >= 0 ? target : 0;
}

function defaultScaleRows(bound: ScaleBound, target: number): IndicatorMatrix["scaleRows"] {
  return defaultScale(bound, safeTarget(target)).map((row) => {
    const threshold = bound === "maximum" ? row.upperBound : row.lowerBound;
    return {
      threshold: threshold === null ? null : String(threshold),
      label: row.label,
      score: String(row.score),
    };
  });
}

/** The matrix a new kind starts with. A scale follows the direction and the target. */
export function matrixOfKind(
  kind: MatrixKind,
  direction: KpiDirection,
  target: number,
): IndicatorMatrix {
  if (kind === "none") return noMatrix();
  if (kind === "table") {
    return {
      ...noMatrix(),
      kind,
      title: "Reference matrix",
      columns: ["Criteria", "Guidance"],
      rows: [["", ""]],
    };
  }
  const bound: ScaleBound = direction === "lower_is_better" ? "maximum" : "minimum";
  return {
    ...noMatrix(),
    kind,
    title: "Numeric threshold scale",
    bound,
    scaleRows: defaultScaleRows(bound, target),
  };
}

/** Changing the threshold type resets the rows, as the legacy builder does. */
export function matrixWithBound(
  matrix: IndicatorMatrix,
  bound: ScaleBound,
  target: number,
): IndicatorMatrix {
  return { ...matrix, bound, scaleRows: defaultScaleRows(bound, target) };
}

const NEW_SCALE_ROW = { threshold: "", label: "", score: "" } as const;

/** A new row goes before the unbounded final row of a maximum scale, and at the end of a minimum scale. */
export function addScaleRow(matrix: IndicatorMatrix): IndicatorMatrix {
  const rows = [...matrix.scaleRows];
  rows.splice(matrix.bound === "maximum" ? Math.max(0, rows.length - 1) : rows.length, 0, {
    ...NEW_SCALE_ROW,
  });
  return { ...matrix, scaleRows: rows };
}

/** The final row of a maximum scale keeps every higher actual covered, so it stays. */
export function removeScaleRow(matrix: IndicatorMatrix, index: number): IndicatorMatrix {
  if (matrix.bound === "maximum" && index === matrix.scaleRows.length - 1) return matrix;
  return { ...matrix, scaleRows: matrix.scaleRows.filter((_row, position) => position !== index) };
}

export function addTableRow(matrix: IndicatorMatrix): IndicatorMatrix {
  return { ...matrix, rows: [...matrix.rows, matrix.columns.map(() => "")] };
}

export function removeTableRow(matrix: IndicatorMatrix, index: number): IndicatorMatrix {
  return { ...matrix, rows: matrix.rows.filter((_row, position) => position !== index) };
}

export function addTableColumn(matrix: IndicatorMatrix): IndicatorMatrix {
  return {
    ...matrix,
    columns: [...matrix.columns, `Column ${matrix.columns.length + 1}`],
    rows: matrix.rows.map((row) => [...row, ""]),
  };
}

export function removeTableColumn(matrix: IndicatorMatrix, index: number): IndicatorMatrix {
  return {
    ...matrix,
    columns: matrix.columns.filter((_column, position) => position !== index),
    rows: matrix.rows.map((row) => row.filter((_cell, position) => position !== index)),
  };
}

/** A blank field is not a number. `Number("")` is 0, which would hide a half-typed threshold. */
function toNumber(text: string): number {
  return text.trim() === "" ? Number.NaN : Number(text);
}

/** The matrix in the shape of the shared rules. Only a scale may score. */
export function toMatrixInput(indicator: { matrix: IndicatorMatrix }): IndicatorMatrixInput {
  const { matrix } = indicator;
  if (matrix.kind === "none") {
    return {
      matrixKind: "none",
      matrixTitle: null,
      scaleBound: null,
      useForScoring: false,
      scales: [],
      matrixColumns: [],
      matrixRows: [],
    };
  }
  if (matrix.kind === "table") {
    return {
      matrixKind: "table",
      matrixTitle: matrix.title,
      scaleBound: null,
      useForScoring: false,
      scales: [],
      matrixColumns: matrix.columns.map((label) => ({ label })),
      matrixRows: matrix.rows.map((cells) => ({ cells })),
    };
  }
  const isMaximum = matrix.bound === "maximum";
  return {
    matrixKind: "scale",
    matrixTitle: matrix.title,
    scaleBound: matrix.bound,
    useForScoring: matrix.scoring,
    scales: matrix.scaleRows.map((row) => {
      const threshold = row.threshold === null ? null : toNumber(row.threshold);
      return {
        lowerBound: isMaximum ? null : threshold,
        upperBound: isMaximum ? threshold : null,
        label: row.label,
        score: toNumber(row.score),
      };
    }),
    matrixColumns: [],
    matrixRows: [],
  };
}
