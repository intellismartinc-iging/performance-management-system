// The request schema must produce the body the Nest /kpi-goals routes accept:
// the scoring flag is `useForScoring`. The server sets the company.
import assert from "node:assert/strict";
import { test } from "node:test";

import * as shared from "../dist/index.js";

const indicator = {
  name: "Sales",
  description: "",
  unit: "PHP",
  direction: "higher_is_better",
  target: 0,
  weight: 100,
};

test("save request uses useForScoring and defaults it to false: a matrix is for reference unless it scores", () => {
  const body = shared.saveGoalTemplateRequestSchema.parse({
    name: "Template",
    positionId: 7,
    indicators: [indicator],
  });
  assert.equal(body.indicators[0].useForScoring, false);
  assert.equal(body.indicators[0].matrixKind, "none");
  assert.equal("isUsedForScoring" in body.indicators[0], false);
});

test("save request carries the template name and description", () => {
  const body = shared.saveGoalTemplateRequestSchema.parse({
    name: "  Software Engineer Performance Goals ",
    description: "  Position targets ",
    positionId: 7,
    indicators: [indicator],
  });
  assert.equal(body.name, "Software Engineer Performance Goals");
  assert.equal(body.description, "Position targets");
});

test("save request makes the description optional and the name required", () => {
  const withoutDescription = shared.saveGoalTemplateRequestSchema.parse({
    name: "Template",
    positionId: 7,
    indicators: [indicator],
  });
  assert.equal(withoutDescription.description, "");

  for (const name of [undefined, "", "   ", "x".repeat(121)]) {
    const result = shared.saveGoalTemplateRequestSchema.safeParse({
      name,
      positionId: 7,
      indicators: [indicator],
    });
    assert.equal(result.success, false, `name ${JSON.stringify(name)}`);
  }
  assert.equal(
    shared.saveGoalTemplateRequestSchema.safeParse({
      name: "Template",
      description: "x".repeat(2001),
      positionId: 7,
      indicators: [indicator],
    }).success,
    false,
  );
});

test("save request accepts a score with up to two decimals", () => {
  const body = shared.saveGoalTemplateRequestSchema.parse({
    name: "Template",
    positionId: 7,
    indicators: [{ ...indicator, scoreTargetMet: 5, scoreBelowTarget: 3.5 }],
  });
  assert.equal(body.indicators[0].scoreBelowTarget, 3.5);
  assert.equal(
    shared.saveGoalTemplateRequestSchema.safeParse({
      name: "Template",
      positionId: 7,
      indicators: [{ ...indicator, scoreBelowTarget: 3.25 }],
    }).success,
    true,
  );
});

test("save request rejects a score outside 1 to 5 or with more than two decimals", () => {
  for (const score of [0.5, 5.5, 3.555, 0]) {
    const result = shared.saveGoalTemplateRequestSchema.safeParse({
      name: "Template",
      positionId: 7,
      indicators: [{ ...indicator, scoreBelowTarget: score }],
    });
    assert.equal(result.success, false, `score ${score}`);
  }
});

test("save request has no company: the server resolves it", () => {
  const body = shared.saveGoalTemplateRequestSchema.parse({
    name: "Template",
    companyId: 3,
    positionId: null,
    indicators: [indicator],
  });
  assert.equal("companyId" in body, false);
});

test("positions response accepts a bigint id as a string", () => {
  const positions = shared.goalTemplatePositionListResponseSchema.parse([
    { positionId: "11", title: "Software Engineer" },
  ]);
  assert.deepEqual(positions, [{ positionId: 11, title: "Software Engineer" }]);
});
