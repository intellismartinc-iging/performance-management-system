// An id is a uuid column in the database. The dev fixtures use ids such as
// 00000000-0000-0000-0000-000000000021, which are valid in PostgreSQL but are not
// RFC 4122 versions, so the id schema must accept any 8-4-4-4-12 hex GUID.
import assert from "node:assert/strict";
import { test } from "node:test";

import * as shared from "../dist/index.js";

test("an id accepts a random uuid and a fixture GUID", () => {
  assert.equal(shared.idSchema.safeParse("3f2504e0-4f89-41d3-9a0c-0305e82c3301").success, true);
  assert.equal(shared.idSchema.safeParse("00000000-0000-0000-0000-000000000021").success, true);
});

test("an id rejects a number, a numeric string, and text", () => {
  for (const value of [4, "4", "not-a-uuid", "", null]) {
    assert.equal(shared.idSchema.safeParse(value).success, false, String(value));
  }
});

test("a template published by a fixture employee still parses", () => {
  const template = shared.kpiGoalTemplatesRowSchema.parse({
    templateId: "00000000-0000-0000-0000-000000000041",
    positionId: 11,
    companyId: 1,
    name: "Software Engineer Performance Goals",
    description: null,
    status: "published",
    currentVersion: 1,
    publishedBy: "00000000-0000-0000-0000-000000000022",
    publishedAt: "2026-11-01T00:00:00.000Z",
    archivedAt: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  });
  assert.equal(template.publishedBy, "00000000-0000-0000-0000-000000000022");
});
