"use client";

import {
  MATRIX_KINDS,
  MATRIX_LIMITS,
  SCALE_BOUNDS,
  indicatorMatrixErrors,
  scaleBoundarySamples,
  scaleDirectionConflicts,
  scaleScore,
  type MatrixKind,
  type ScaleBound,
} from "@pms/shared-types";

import { FormSelect } from "@/components/molecules/form-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KPI_DIRECTION_LABELS,
  MATRIX_KIND_LABELS,
  SCALE_BOUND_LABELS,
} from "@/constants/domain-labels";
import type { Indicator } from "@/features/review-templates/components/kpi-goal-template-editor";
import {
  addScaleRow,
  addTableColumn,
  addTableRow,
  matrixOfKind,
  matrixWithBound,
  removeScaleRow,
  removeTableColumn,
  removeTableRow,
  toMatrixInput,
  type IndicatorMatrix,
} from "@/features/review-templates/services/indicator-matrix";

const KIND_OPTIONS = MATRIX_KINDS.map((value) => ({
  value,
  label: MATRIX_KIND_LABELS[value],
}));
const BOUND_OPTIONS = SCALE_BOUNDS.map((value) => ({
  value,
  label: SCALE_BOUND_LABELS[value],
}));

const CONTROL = "min-h-pms-touch rounded-pms-control";
const NO_UPPER_LIMIT = "No upper limit";

interface IndicatorMatrixEditorProps {
  indicator: Pick<Indicator, "id" | "direction" | "target" | "matrix">;
  /** True in the builder's preview: the matrix is shown as text, with no controls. */
  isPreview: boolean;
  /** The first problem with this matrix, shown under it. */
  error?: string;
  onChange: (matrix: IndicatorMatrix) => void;
}

/** A target the user has not typed yet is treated as zero. */
function targetOf(indicator: Pick<Indicator, "target">): number {
  const target = Number(indicator.target);
  return Number.isFinite(target) && target >= 0 ? target : 0;
}

/**
 * The matrix of one indicator, as in the legacy builder: no matrix, a custom
 * reference table, or a numeric threshold scale with a boundary preview. A scale may
 * set the score. A table never does.
 */
export function IndicatorMatrixEditor({
  indicator,
  isPreview,
  error,
  onChange,
}: IndicatorMatrixEditorProps) {
  const { matrix } = indicator;

  if (isPreview) {
    return matrix.kind === "none" ? null : (
      <section
        aria-label="Indicator matrix"
        className="grid min-w-0 gap-3 border-t border-border pt-4"
      >
        <MatrixReference indicator={indicator} />
      </section>
    );
  }

  return (
    <section
      aria-label="Indicator matrix"
      className="grid min-w-0 gap-4 border-t border-border pt-4"
    >
      <FormSelect<MatrixKind>
        id={`${indicator.id}-matrix-kind`}
        label="Indicator matrix"
        error={error}
        value={matrix.kind}
        options={KIND_OPTIONS}
        onChange={(kind) => {
          if (kind !== matrix.kind) {
            onChange(matrixOfKind(kind, indicator.direction, targetOf(indicator)));
          }
        }}
      />
      {matrix.kind !== "none" && (
        <Field>
          <FieldLabel htmlFor={`${indicator.id}-matrix-title`} className="text-pms-label">
            Matrix title
          </FieldLabel>
          <Input
            id={`${indicator.id}-matrix-title`}
            maxLength={MATRIX_LIMITS.titleLength}
            value={matrix.title}
            className={CONTROL}
            onChange={(event) => onChange({ ...matrix, title: event.currentTarget.value })}
          />
        </Field>
      )}
      {matrix.kind === "scale" && (
        <ScaleEditor indicator={indicator} onChange={onChange} />
      )}
      {matrix.kind === "table" && <TableEditor matrix={matrix} onChange={onChange} />}
    </section>
  );
}

function scoringHelp(matrix: IndicatorMatrix): string {
  const rule =
    matrix.bound === "maximum"
      ? "Maximum thresholds increase. A row includes its maximum and starts above the previous maximum. The final row has no upper limit."
      : "Minimum thresholds start at 0 and increase. Each applies until the next minimum; the last has no upper limit.";
  const effect = matrix.scoring
    ? "This scale replaces target-met / below-target scoring."
    : "Reference only. Existing target-met / below-target scoring applies.";
  return `${rule} ${effect}`;
}

function ScaleEditor({
  indicator,
  onChange,
}: {
  indicator: IndicatorMatrixEditorProps["indicator"];
  onChange: (matrix: IndicatorMatrix) => void;
}) {
  const { matrix } = indicator;
  const thresholdLabel = matrix.bound === "maximum" ? "Maximum actual" : "Minimum actual";

  function changeRow(
    position: number,
    changes: Partial<IndicatorMatrix["scaleRows"][number]>,
  ) {
    onChange({
      ...matrix,
      scaleRows: matrix.scaleRows.map((row, index) =>
        index === position ? { ...row, ...changes } : row,
      ),
    });
  }

  return (
    <div className="grid min-w-0 gap-4">
      <FormSelect<ScaleBound>
        id={`${indicator.id}-scale-bound`}
        label="Threshold type (changing resets scale rows)"
        value={matrix.bound}
        options={BOUND_OPTIONS}
        onChange={(bound) => {
          if (bound !== matrix.bound) {
            onChange(matrixWithBound(matrix, bound, targetOf(indicator)));
          }
        }}
      />
      <FieldLabel className="flex w-fit items-center gap-2 text-pms-label">
        <Checkbox
          aria-label="Use for scoring"
          checked={matrix.scoring}
          onCheckedChange={(checked) => onChange({ ...matrix, scoring: checked === true })}
        />
        Use for scoring
      </FieldLabel>
      <p className="text-pms-body text-muted-foreground">{scoringHelp(matrix)}</p>
      <Table scrollRegionLabel="Scale rows" className="text-pms-table">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{thresholdLabel}</TableHead>
            <TableHead scope="col">Rating label</TableHead>
            <TableHead scope="col">Score (1–5)</TableHead>
            <TableHead scope="col">Row</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.scaleRows.map((row, index) => {
            const isFinalMaximum =
              matrix.bound === "maximum" && index === matrix.scaleRows.length - 1;
            const position = index + 1;
            return (
              <TableRow key={index}>
                <TableCell>
                  {row.threshold === null ? (
                    NO_UPPER_LIMIT
                  ) : (
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      aria-label={`${thresholdLabel}, row ${position}`}
                      value={row.threshold}
                      className={CONTROL}
                      onChange={(event) =>
                        changeRow(index, { threshold: event.currentTarget.value })
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Rating label, row ${position}`}
                    maxLength={MATRIX_LIMITS.labelLength}
                    value={row.label}
                    className={CONTROL}
                    onChange={(event) => changeRow(index, { label: event.currentTarget.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="any"
                    min={1}
                    max={5}
                    aria-label={`Score, row ${position}`}
                    value={row.score}
                    className={CONTROL}
                    onChange={(event) => changeRow(index, { score: event.currentTarget.value })}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-pms-touch"
                    aria-label={`Remove row ${position}`}
                    disabled={isFinalMaximum || matrix.scaleRows.length <= 1}
                    title={isFinalMaximum ? "The final row keeps all higher actuals covered." : undefined}
                    onClick={() => onChange(removeScaleRow(matrix, index))}
                  >
                    Remove row
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="outline"
        className="min-h-pms-touch justify-self-start"
        disabled={matrix.scaleRows.length >= MATRIX_LIMITS.scaleRows}
        onClick={() => onChange(addScaleRow(matrix))}
      >
        Add row
      </Button>
      <BoundaryPreview indicator={indicator} />
    </div>
  );
}

/** What the scale scores at zero, just below the target, at it, and just above it. */
function BoundaryPreview({
  indicator,
}: {
  indicator: Pick<Indicator, "direction" | "target" | "matrix">;
}) {
  const input = toMatrixInput(indicator);
  const errors = indicatorMatrixErrors(input);
  const { matrix } = indicator;

  return (
    <section
      aria-label="Boundary score preview"
      aria-live="polite"
      className="grid min-w-0 gap-2 text-pms-label"
    >
      <h5 className="font-semibold">Boundary score preview</h5>
      {errors.length > 0 ? (
        <p className="text-muted-foreground">{errors.join(" ")}</p>
      ) : (
        <>
          {scaleDirectionConflicts(indicator.direction, input.scales) && (
            <p role="status" className="text-(color:--pms-ink-on-tint)">
              Scale scoring conflicts with the indicator’s{" "}
              {KPI_DIRECTION_LABELS[indicator.direction]} direction. Review the
              custom scores and boundaries; they have been kept unchanged.
            </p>
          )}
          <p className="text-muted-foreground">
            {matrix.scoring
              ? "These matrix scores apply to actual results."
              : "Proposed matrix scores. Enable Use for scoring to apply them."}
          </p>
          <Table className="text-pms-table tabular-nums">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Check</TableHead>
                <TableHead scope="col">Actual</TableHead>
                <TableHead scope="col">Matrix score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scaleBoundarySamples(targetOf(indicator)).map((sample) => {
                const score = scaleScore(input, sample.actual);
                return (
                  <TableRow key={sample.label}>
                    <TableCell>{sample.label}</TableCell>
                    <TableCell>{Number(sample.actual.toPrecision(10))}</TableCell>
                    <TableCell>
                      {sample.actual < 0
                        ? "Outside nonnegative actual range"
                        : score === null
                          ? "No score"
                          : `${score}/5`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </section>
  );
}

function TableEditor({
  matrix,
  onChange,
}: {
  matrix: IndicatorMatrix;
  onChange: (matrix: IndicatorMatrix) => void;
}) {
  function changeColumn(position: number, label: string) {
    onChange({
      ...matrix,
      columns: matrix.columns.map((column, index) => (index === position ? label : column)),
    });
  }

  function changeCell(row: number, column: number, value: string) {
    onChange({
      ...matrix,
      rows: matrix.rows.map((cells, index) =>
        index === row ? cells.map((cell, at) => (at === column ? value : cell)) : cells,
      ),
    });
  }

  return (
    <div className="grid min-w-0 gap-4">
      <p className="text-pms-body text-muted-foreground">
        Add your own columns and rows for reference. This table does not change scoring.
      </p>
      <Table scrollRegionLabel="Reference table" className="text-pms-table">
        <TableHeader>
          <TableRow>
            {matrix.columns.map((column, index) => (
              <TableHead key={index} scope="col">
                <div className="grid gap-2">
                  <Input
                    aria-label={`Column ${index + 1} label`}
                    maxLength={MATRIX_LIMITS.labelLength}
                    value={column}
                    className={CONTROL}
                    onChange={(event) => changeColumn(index, event.currentTarget.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-pms-touch"
                    aria-label={`Remove column ${index + 1}`}
                    disabled={matrix.columns.length <= 1}
                    onClick={() => onChange(removeTableColumn(matrix, index))}
                  >
                    Remove column
                  </Button>
                </div>
              </TableHead>
            ))}
            <TableHead scope="col">Row</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.rows.map((cells, rowIndex) => (
            <TableRow key={rowIndex}>
              {cells.map((cell, columnIndex) => (
                <TableCell key={columnIndex}>
                  <Input
                    aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`}
                    maxLength={MATRIX_LIMITS.cellLength}
                    value={cell}
                    className={CONTROL}
                    onChange={(event) => changeCell(rowIndex, columnIndex, event.currentTarget.value)}
                  />
                </TableCell>
              ))}
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-pms-touch"
                  aria-label={`Remove row ${rowIndex + 1}`}
                  disabled={matrix.rows.length <= 1}
                  onClick={() => onChange(removeTableRow(matrix, rowIndex))}
                >
                  Remove row
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          disabled={matrix.rows.length >= MATRIX_LIMITS.tableRows}
          onClick={() => onChange(addTableRow(matrix))}
        >
          Add row
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          disabled={matrix.columns.length >= MATRIX_LIMITS.tableColumns}
          onClick={() => onChange(addTableColumn(matrix))}
        >
          Add column
        </Button>
      </div>
    </div>
  );
}

/** The matrix as text, for the builder's preview. */
function MatrixReference({
  indicator,
}: {
  indicator: Pick<Indicator, "id" | "direction" | "target" | "matrix">;
}) {
  const { matrix } = indicator;
  const isScale = matrix.kind === "scale";
  const isMaximum = matrix.bound === "maximum";
  const thresholdLabel = isMaximum ? "Maximum actual (inclusive)" : "Minimum actual";

  return (
    <div className="grid min-w-0 gap-3">
      <div className="grid gap-1">
        <h4 className="text-pms-label font-semibold">
          {matrix.title || MATRIX_KIND_LABELS[matrix.kind]}
        </h4>
        <p className="text-pms-label text-muted-foreground">
          {isScale && matrix.scoring ? "Used for scoring" : "Reference only"}
        </p>
      </div>
      <Table scrollRegionLabel={`${MATRIX_KIND_LABELS[matrix.kind]} of the indicator`} className="text-pms-table">
        <TableHeader>
          <TableRow>
            {isScale ? (
              <>
                <TableHead scope="col">{thresholdLabel}</TableHead>
                <TableHead scope="col">Rating label</TableHead>
                <TableHead scope="col">Score</TableHead>
              </>
            ) : (
              matrix.columns.map((column, index) => (
                <TableHead key={index} scope="col">
                  {column}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isScale
            ? matrix.scaleRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.threshold ?? NO_UPPER_LIMIT}</TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.score}</TableCell>
                </TableRow>
              ))
            : matrix.rows.map((cells, index) => (
                <TableRow key={index}>
                  {cells.map((cell, at) => (
                    <TableCell key={at}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {isScale && <BoundaryPreview indicator={indicator} />}
    </div>
  );
}
