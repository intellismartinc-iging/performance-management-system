// The auth schemas must match what backend/src/modules/auth accepts and returns.
import assert from "node:assert/strict";
import { test } from "node:test";

import * as shared from "../dist/index.js";

test("login takes identifier and password, not email", () => {
  assert.equal(
    shared.loginRequestSchema.safeParse({
      identifier: "ADMIN",
      password: "admin123",
    }).success,
    true,
  );
  assert.equal(
    shared.loginRequestSchema.safeParse({
      email: "a@b.co",
      password: "admin123",
    }).success,
    false,
  );
});

test("login password is 8 to 16 characters", () => {
  const body = (password) =>
    shared.loginRequestSchema.safeParse({ identifier: "ADMIN", password })
      .success;
  assert.equal(body("1234567"), false);
  assert.equal(body("12345678"), true);
  assert.equal(body("1234567890123456"), true);
  assert.equal(body("12345678901234567"), false);
});

test("the backend has no sign-up or register route, so the package exports no contract for them", () => {
  for (const name of [
    "signUpRequestSchema",
    "registerRequestSchema",
    "accountCreatedResponseSchema",
  ]) {
    assert.equal(name in shared, false, `${name} is still exported`);
  }
});

test("token response needs accessToken and expiresIn", () => {
  assert.equal(
    shared.authTokenResponseSchema.safeParse({
      accessToken: "x",
      expiresIn: 3600,
    }).success,
    true,
  );
  assert.equal(
    shared.authTokenResponseSchema.safeParse({ accessToken: "x" }).success,
    false,
  );
});

test("current user carries a role code from pms.user_role", () => {
  const user = {
    userId: "1",
    email: "jane@example.com",
    username: "jane",
    role: "MANAGER",
    employeeCode: "ITI-003",
    firstName: "Jane",
    lastName: "Doe",
  };
  assert.equal(shared.currentUserDtoSchema.safeParse(user).success, true);
  assert.equal(
    shared.currentUserDtoSchema.safeParse({ ...user, role: "manager" }).success,
    false,
  );
  assert.deepEqual([...shared.ROLE_CODES], ["ADMIN", "MANAGER", "USER"]);
});
