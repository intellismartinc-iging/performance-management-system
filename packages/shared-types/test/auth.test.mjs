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

test("sign-up needs matching passwords", () => {
  const base = {
    employeeCode: "EMP-001",
    username: "jane",
    password: "password123",
  };
  assert.equal(
    shared.signUpRequestSchema.safeParse({
      ...base,
      confirmPassword: "password123",
    }).success,
    true,
  );
  assert.equal(
    shared.signUpRequestSchema.safeParse({
      ...base,
      confirmPassword: "different1",
    }).success,
    false,
  );
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

test("the Nest default error body parses, with one or many messages", () => {
  assert.equal(
    shared.nestErrorSchema.safeParse({
      statusCode: 401,
      message: "Invalid credentials",
      error: "Unauthorized",
    }).success,
    true,
  );
  assert.equal(
    shared.nestErrorSchema.safeParse({
      statusCode: 400,
      message: ["password must be longer than or equal to 8 characters"],
    }).success,
    true,
  );
});
