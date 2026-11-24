import type { GoalTemplateDetailResponseDto } from "@pms/shared-types";

import type {
  Indicator,
  KpiGoalTemplate,
} from "@/features/review-templates/components/kpi-goal-template-editor";
import {
  noMatrix,
  type IndicatorMatrix,
} from "@/features/review-templates/services/indicator-matrix";

type Detail = GoalTemplateDetailResponseDto;
type DetailIndicator = Detail["indicators"][number];

const text = (value: string | number | null): string =>
  value === null ? "" : String(value);

/** Scale rows in threshold order: a null threshold (the open final row) goes last. */
function scaleRowsOf(detail: Detail, indicator: DetailIndicator): IndicatorMatrix["scaleRows"] {
  const isMaximum = indicator.scaleBound === "maximum";
  const thresholdOf = (row: { lowerBound: number | null; upperBound: number | null }) =>
    isMaximum ? row.upperBound : row.lowerBound;

  return detail.scales
    .filter((row) => row.indicatorId === indicator.indicatorId)
    .sort(
      (a, b) =>
        (thresholdOf(a) ?? Number.POSITIVE_INFINITY) - (thresholdOf(b) ?? Number.POSITIVE_INFINITY),
    )
    .map((row) => {
      const threshold = thresholdOf(row);
      return {
        threshold: threshold === null ? null : String(threshold),
        label: row.label ?? "",
        score: String(row.score),
      };
    });
}

/** Columns and rows by position; a missing cell is an empty string. */
function tableOf(detail: Detail, indicator: DetailIndicator) {
  const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
  const columns = detail.matrixColumns
    .filter((column) => column.indicatorId === indicator.indicatorId)
    .sort(byPosition);
  const rows = detail.matrixRows
    .filter((row) => row.indicatorId === indicator.indicatorId)
    .sort(byPosition);

  return {
    columns: columns.map((column) => column.colLabel),
    rows: rows.map((row) =>
      columns.map(
        (column) =>
          detail.matrixCells.find(
            (cell) => cell.rowId === row.rowId && cell.colId === column.colId,
          )?.value ?? "",
      ),
    ),
  };
}

function matrixOf(detail: Detail, indicator: DetailIndicator): IndicatorMatrix {
  if (indicator.matrixKind === "none") return noMatrix();
  const base = { ...noMatrix(), kind: indicator.matrixKind, title: text(indicator.matrixTitle) };

  if (indicator.matrixKind === "table") return { ...base, ...tableOf(detail, indicator) };
  return {
    ...base,
    bound: indicator.scaleBound ?? "minimum",
    scoring: indicator.useForScoring,
    scaleRows: scaleRowsOf(detail, indicator),
  };
}

function indicatorOf(detail: Detail, indicator: DetailIndicator): Indicator {
  return {
    id: indicator.indicatorId,
    name: indicator.name,
    description: text(indicator.description),
    unit: text(indicator.unit),
    direction: indicator.direction,
    target: text(indicator.target),
    weight: text(indicator.weight),
    scoreMet: text(indicator.scoreTargetMet),
    scoreBelow: text(indicator.scoreBelowTarget),
    matrix: matrixOf(detail, indicator),
  };
}

/** A saved template as the editor holds it: every value as the text the user would type. */
export function fromGoalTemplateDetail(detail: Detail): KpiGoalTemplate {
  return {
    name: text(detail.template.name),
    description: text(detail.template.description),
    position: text(detail.template.position),
    indicators: detail.indicators.map((indicator) => indicatorOf(detail, indicator)),
  };
}

/**
 * A key that changes when the saved template changes. A page that keeps its
 * state (an error message, the typed edits) between visits uses it to start
 * again from the saved template, so a stale message or draft never outlives a save.
 */
export function stateKey(detail: Detail): string {
  const { templateId, status, currentVersion, updatedAt } = detail.template;
  return `${templateId}:${status}:${currentVersion}:${updatedAt}`;
}
