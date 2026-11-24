// The matrix rules are shared by the API, the save schema, and the editor, so a
// body the editor accepts is a body the API accepts. The rules follow the legacy
// builder and PRD Tpl-G-004 and Tpl-G-005.
import assert from "node:assert/strict";
import { test } from "node:test";

import * as shared from "../dist/index.js";

const row = (lowerBound, upperBound, label, score) => ({ lowerBound, upperBound, label, score });

const minimumScale = (overrides = {}) => ({
  matrixKind: "scale",
  matrixTitle: "Numeric threshold scale",
  scaleBound: "minimum",
  useForScoring: false,
  scales: [row(0, null, "Below target", 1), row(90, null, "Target met", 5)],
  matrixColumns: [],
  matrixRows: [],
  ...overrides,
});

const maximumScale = (overrides = {}) => ({
  matrixKind: "scale",
  matrixTitle: "Numeric threshold scale",
  scaleBound: "maximum",
  useForScoring: false,
  scales: [row(null, 10, "Target met", 5), row(null, null, "Below target", 1)],
  matrixColumns: [],
  matrixRows: [],
  ...overrides,
});

const table = (overrides = {}) => ({
  matrixKind: "table",
  matrixTitle: "Reference matrix",
  scaleBound: null,
  useForScoring: false,
  scales: [],
  matrixColumns: [{ label: "Criteria" }, { label: "Guidance" }],
  matrixRows: [{ cells: ["Quality", "No defects"] }],
  ...overrides,
});

const none = (overrides = {}) => ({
  matrixKind: "none",
  matrixTitle: null,
  scaleBound: null,
  useForScoring: false,
  scales: [],
  matrixColumns: [],
  matrixRows: [],
  ...overrides,
});

const errors = (matrix) => shared.indicatorMatrixErrors(matrix);

test("no matrix is valid, and carries no rows, no title, and no scoring", () => {
  assert.deepEqual(errors(none()), []);
  assert.notDeepEqual(errors(none({ scales: [row(0, null, "x", 1)] })), []);
  assert.notDeepEqual(errors(none({ matrixTitle: "Orphan title" })), []);
  assert.match(errors(none({ useForScoring: true })).join(" "), /Only numeric threshold scales/);
});

test("a minimum scale starts at 0 and increases, with the last row unbounded above", () => {
  assert.deepEqual(errors(minimumScale()), []);
  assert.notDeepEqual(errors(minimumScale({ scales: [row(5, null, "a", 1)] })), [], "must start at 0");
  assert.notDeepEqual(
    errors(minimumScale({ scales: [row(0, null, "a", 1), row(50, null, "b", 3), row(50, null, "c", 5)] })),
    [],
    "must increase strictly",
  );
  assert.notDeepEqual(errors(minimumScale({ scales: [row(0, 10, "a", 1)] })), [], "no maximum on a minimum scale");
  assert.notDeepEqual(errors(minimumScale({ scales: [row(-1, null, "a", 1)] })), []);
});

test("a maximum scale increases, and only the final row has no upper limit", () => {
  assert.deepEqual(errors(maximumScale()), []);
  assert.notDeepEqual(
    errors(maximumScale({ scales: [row(null, 10, "a", 5), row(null, 20, "b", 1)] })),
    [],
    "the final row needs no upper limit",
  );
  assert.notDeepEqual(
    errors(maximumScale({ scales: [row(null, null, "a", 5), row(null, null, "b", 1)] })),
    [],
    "only the final row may be unbounded",
  );
  assert.notDeepEqual(
    errors(maximumScale({ scales: [row(null, 20, "a", 5), row(null, 10, "b", 3), row(null, null, "c", 1)] })),
    [],
    "maximums must increase",
  );
  assert.notDeepEqual(errors(maximumScale({ scales: [row(0, 10, "a", 5), row(null, null, "b", 1)] })), []);
});

test("a scale row needs a label and a score from 1 to 5 with at most two decimals", () => {
  for (const score of [0, 0.5, 5.5, 3.555, Number.NaN]) {
    assert.notDeepEqual(
      errors(minimumScale({ scales: [row(0, null, "a", score)] })),
      [],
      `score ${score}`,
    );
  }
  assert.deepEqual(errors(minimumScale({ scales: [row(0, null, "a", 3.5)] })), []);
  assert.notDeepEqual(errors(minimumScale({ scales: [row(0, null, "   ", 3)] })), []);
});

test("a scale needs a title and a threshold type", () => {
  assert.notDeepEqual(errors(minimumScale({ matrixTitle: "  " })), []);
  assert.notDeepEqual(errors(minimumScale({ matrixTitle: "x".repeat(121) })), []);
  assert.notDeepEqual(errors(minimumScale({ scaleBound: null })), []);
  assert.notDeepEqual(errors(minimumScale({ scales: [] })), []);
});

test("a scale may score, and a table and no matrix may not", () => {
  assert.deepEqual(errors(minimumScale({ useForScoring: true })), []);
  assert.match(errors(table({ useForScoring: true })).join(" "), /Only numeric threshold scales/);
});

test("a reference table has labeled columns and a complete cell for each column in each row", () => {
  assert.deepEqual(errors(table()), []);
  assert.notDeepEqual(errors(table({ matrixColumns: [] })), []);
  assert.notDeepEqual(errors(table({ matrixColumns: [{ label: "  " }, { label: "B" }] })), []);
  assert.notDeepEqual(errors(table({ matrixRows: [] })), []);
  assert.notDeepEqual(errors(table({ matrixRows: [{ cells: ["only one"] }] })), []);
  assert.deepEqual(errors(table({ matrixRows: [{ cells: ["", ""] }] })), [], "an empty cell is allowed");
  assert.notDeepEqual(errors(table({ scales: [row(0, null, "a", 1)] })), []);
});

test("the sizes are capped, because the matrix comes from outside", () => {
  const manyRows = Array.from({ length: 21 }, (_, index) => row(index, null, `r${index}`, 3));
  assert.notDeepEqual(errors(minimumScale({ scales: manyRows })), []);
  const wide = Array.from({ length: 11 }, (_, index) => ({ label: `c${index}` }));
  assert.notDeepEqual(
    errors(table({ matrixColumns: wide, matrixRows: [{ cells: wide.map(() => "x") }] })),
    [],
  );
  assert.notDeepEqual(errors(table({ matrixRows: [{ cells: ["x".repeat(501), "y"] }] })), []);
});

test("the default scale follows the direction and the target", () => {
  assert.deepEqual(shared.defaultScale("minimum", 90), [
    row(0, null, "Below target", 1),
    row(90, null, "Target met", 5),
  ]);
  assert.deepEqual(shared.defaultScale("minimum", 0), [row(0, null, "Target met", 5)]);
  assert.deepEqual(shared.defaultScale("maximum", 10), [
    row(null, 10, "Target met", 5),
    row(null, null, "Below target", 1),
  ]);
  for (const bound of ["minimum", "maximum"]) {
    for (const target of [0, 10, 99.5]) {
      const scales = shared.defaultScale(bound, target);
      assert.deepEqual(errors({ ...minimumScale(), scaleBound: bound, scales }), [], `${bound} ${target}`);
    }
  }
});

test("a minimum scale scores the last row at or below the actual", () => {
  const scale = minimumScale({
    scales: [row(0, null, "Below", 1), row(2, null, "Near", 3), row(4, null, "Met", 5)],
  });
  assert.equal(shared.scaleScore(scale, 0), 1);
  assert.equal(shared.scaleScore(scale, 1.99), 1);
  assert.equal(shared.scaleScore(scale, 2), 3, "the minimum is inclusive");
  assert.equal(shared.scaleScore(scale, 4), 5);
  assert.equal(shared.scaleScore(scale, 1000), 5);
  assert.equal(shared.scaleScore(scale, -1), null);
});

test("a maximum scale scores the first row whose maximum is at or above the actual", () => {
  const scale = maximumScale({
    scales: [row(null, 1, "Met", 5), row(null, 3, "Near", 3), row(null, null, "Above", 1)],
  });
  assert.equal(shared.scaleScore(scale, 0), 5);
  assert.equal(shared.scaleScore(scale, 1), 5, "the maximum is inclusive");
  assert.equal(shared.scaleScore(scale, 1.01), 3);
  assert.equal(shared.scaleScore(scale, 3), 3);
  assert.equal(shared.scaleScore(scale, 1000), 1);
});

test("an invalid scale scores nothing", () => {
  assert.equal(shared.scaleScore(minimumScale({ scales: [] }), 5), null);
});

test("the boundary samples are zero, just below the target, the target, and just above", () => {
  const samples = shared.scaleBoundarySamples(90);
  assert.deepEqual(
    samples.map((sample) => sample.label),
    ["Zero", "Below target", "Exact target", "Above target"],
  );
  assert.equal(samples[0].actual, 0);
  assert.ok(samples[1].actual < 90 && samples[1].actual > 89.99);
  assert.equal(samples[2].actual, 90);
  assert.ok(samples[3].actual > 90 && samples[3].actual < 90.01);
});

test("the boundary samples of a zero target step by a small positive amount", () => {
  const [zero, below, exact, above] = shared.scaleBoundarySamples(0);
  assert.equal(zero.actual, 0);
  assert.ok(below.actual < 0, "just below a zero target is negative");
  assert.equal(exact.actual, 0);
  assert.ok(above.actual > 0);
});

test("a scale that fights the direction is reported, and does not block", () => {
  const rising = minimumScale({ scales: [row(0, null, "a", 1), row(5, null, "b", 5)] });
  assert.equal(shared.scaleDirectionConflicts("higher_is_better", rising.scales), false);
  assert.equal(shared.scaleDirectionConflicts("lower_is_better", rising.scales), true);
  const falling = minimumScale({ scales: [row(0, null, "a", 5), row(5, null, "b", 1)] });
  assert.equal(shared.scaleDirectionConflicts("higher_is_better", falling.scales), true);
  assert.deepEqual(errors(falling), [], "a conflict is a warning, not an error");
});

test("the save schema accepts a scale and a table, and rejects an invalid matrix", () => {
  const indicator = {
    name: "Defects",
    description: "",
    unit: "Count",
    direction: "lower_is_better",
    target: 2,
    weight: 100,
    scoreTargetMet: 5,
    scoreBelowTarget: 2,
  };
  const save = (matrix) =>
    shared.saveGoalTemplateRequestSchema.safeParse({
      name: "Template",
      position: "Software Engineer",
      indicators: [{ ...indicator, ...matrix }],
    });

  assert.equal(save({}).success, true, "no matrix by default");
  assert.equal(save(maximumScale({ useForScoring: true })).success, true);
  assert.equal(save(table()).success, true);
  assert.equal(save(minimumScale({ scales: [row(5, null, "a", 1)] })).success, false);
  assert.equal(save(table({ useForScoring: true })).success, false);
});
