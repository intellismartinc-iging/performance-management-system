import assert from "node:assert/strict";
import test from "node:test";
import { saveGoalTemplateRequestSchema, targetExceedsUnit } from "../dist/index.js";

const indicator = (unit, target) => ({
  name: "Delivery rate",
  unit,
  direction: "higher_is_better",
  target,
  weight: 100,
});
const body = (unit, target) => ({ name: "Goals", position: "Software Engineer", indicators: [indicator(unit, target)] });

test("a percentage target above 100 is out of range", () => {
  assert.equal(targetExceedsUnit("Percentage", 100.01), true);
  assert.equal(targetExceedsUnit("Percentage", 100), false);
  assert.equal(targetExceedsUnit("Percentage", 0), false);
  assert.equal(targetExceedsUnit("Count", 500), false);
  assert.equal(targetExceedsUnit("Percentage", null), false);
});

test("the save request refuses a percentage target above 100 and accepts 100", () => {
  assert.equal(saveGoalTemplateRequestSchema.safeParse(body("Percentage", 120)).success, false);
  assert.equal(saveGoalTemplateRequestSchema.safeParse(body("Percentage", 100)).success, true);
  assert.equal(saveGoalTemplateRequestSchema.safeParse(body("Count", 120)).success, true);
});
