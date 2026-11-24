// A template that is published must total 100 percent (Tpl-G-003). The server and the
// editor use the same rule.
import assert from "node:assert/strict";
import { test } from "node:test";

import * as shared from "../dist/index.js";

test("weights that total 100 pass, with a small tolerance for decimals", () => {
  assert.equal(shared.weightsTotalHundred([60, 40]), true);
  assert.equal(shared.weightsTotalHundred([33.33, 33.33, 33.34]), true);
  assert.equal(shared.weightsTotalHundred([0.1, 0.2, 99.7]), true);
});

test("any other total fails, and no weights fail", () => {
  assert.equal(shared.weightsTotalHundred([60, 39]), false);
  assert.equal(shared.weightsTotalHundred([60, 41]), false);
  assert.equal(shared.weightsTotalHundred([]), false);
});

test("the request schema carries the id of an existing indicator, and only a uuid", () => {
  const indicator = {
    name: "Sales",
    unit: "Percentage",
    direction: "higher_is_better",
    target: 90,
    weight: 100,
  };
  const parse = (indicatorId) =>
    shared.saveGoalTemplateRequestSchema.safeParse({
      name: "Template",
      position: "Software Engineer",
      indicators: [{ ...indicator, indicatorId }],
    });

  assert.equal(parse(undefined).success, true);
  assert.equal(parse("3f2504e0-4f89-41d3-9a0c-0305e82c3303").success, true);
  assert.equal(parse("indicator-1").success, false);
});
