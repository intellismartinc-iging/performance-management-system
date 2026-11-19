// The KPI Goal Template list and detail schemas must accept the payload the
// Nest /kpi-goals routes return: bigint ids and numeric columns as strings,
// timestamps as ISO text, a flat tree, and `useForScoring` on an indicator.
import assert from "node:assert/strict";
import { test } from "node:test";

import * as shared from "../dist/index.js";

const template = {
  templateId: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  positionId: "7",
  companyId: "1",
  name: "Software Engineer Performance Goals",
  description: null,
  status: "draft",
  currentVersion: 1,
  publishedBy: null,
  publishedAt: null,
  archivedAt: null,
  createdAt: "2026-11-13T08:00:00.000Z",
  updatedAt: "2026-11-13T08:00:00.000Z",
};

const version = {
  versionId: "3f2504e0-4f89-41d3-9a0c-0305e82c3302",
  templateId: template.templateId,
  version: 1,
  frozenAt: null,
  createdBy: null,
  createdAt: "2026-11-13T08:00:00.000Z",
};

const indicator = {
  indicatorId: "3f2504e0-4f89-41d3-9a0c-0305e82c3303",
  versionId: version.versionId,
  name: "Sales",
  description: null,
  unit: "PHP",
  target: "0",
  direction: "higher_is_better",
  weight: "100.00",
  scoreTargetMet: 5,
  scoreBelowTarget: 2,
  matrixKind: "none",
  matrixTitle: null,
  scaleBound: null,
  useForScoring: false,
};

test("list item accepts a bigint position, a title, and a count as strings", () => {
  const item = shared.goalTemplateListResponseSchema.parse([
    { ...template, positionTitle: "Software Engineer", indicatorCount: "4" },
  ])[0];
  assert.equal(item.positionId, 7);
  assert.equal(item.positionTitle, "Software Engineer");
  assert.equal(item.indicatorCount, 4);
  assert.equal(item.status, "draft");
});

test("list item accepts a company-wide template with no position title", () => {
  const item = shared.goalTemplateListResponseSchema.parse([
    { ...template, positionId: null, positionTitle: null, indicatorCount: 0 },
  ])[0];
  assert.equal(item.positionTitle, null);
});

test("list item rejects a negative indicator count", () => {
  const result = shared.goalTemplateListResponseSchema.safeParse([
    { ...template, positionTitle: null, indicatorCount: -1 },
  ]);
  assert.equal(result.success, false);
});

test("detail accepts the flat tree and keeps a zero target", () => {
  const detail = shared.goalTemplateDetailResponseSchema.parse({
    template,
    version,
    indicators: [indicator],
    scales: [],
    matrixRows: [],
    matrixColumns: [],
    matrixCells: [],
  });
  assert.equal(detail.indicators[0].target, 0);
  assert.equal(detail.indicators[0].weight, 100);
  assert.equal(detail.indicators[0].useForScoring, false);
});

test("detail turns a numeric score string into a number", () => {
  const detail = shared.goalTemplateDetailResponseSchema.parse({
    template,
    version,
    indicators: [{ ...indicator, scoreTargetMet: "5.00", scoreBelowTarget: "3.50" }],
    scales: [],
    matrixRows: [],
    matrixColumns: [],
    matrixCells: [],
  });
  assert.equal(detail.indicators[0].scoreTargetMet, 5);
  assert.equal(detail.indicators[0].scoreBelowTarget, 3.5);
});

test("detail accepts a template with no version yet", () => {
  const detail = shared.goalTemplateDetailResponseSchema.parse({
    template,
    version: null,
    indicators: [],
    scales: [],
    matrixRows: [],
    matrixColumns: [],
    matrixCells: [],
  });
  assert.equal(detail.version, null);
  assert.equal(detail.template.positionId, 7);
});

test("detail rejects an unknown status code", () => {
  const result = shared.goalTemplateDetailResponseSchema.safeParse({
    template: { ...template, status: "Published" },
    version,
    indicators: [],
    scales: [],
    matrixRows: [],
    matrixColumns: [],
    matrixCells: [],
  });
  assert.equal(result.success, false);
});
