import { describe, expect, it } from "vitest";

import {
  decideRoute,
  isAuthPage,
  readTokenExpiry,
} from "@/features/auth/services/session-guard";

const NOW = 1_800_000_000;

/** A token shaped like the backend's: header.payload.signature, payload in base64url. */
function tokenWith(payload: object) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
}

const VALID = tokenWith({ sub: "u1", type: "access", exp: NOW + 3600 });
const EXPIRED = tokenWith({ sub: "u1", type: "access", exp: NOW - 1 });

describe("readTokenExpiry", () => {
  it("reads exp from the payload", () => {
    expect(readTokenExpiry(VALID)).toBe(NOW + 3600);
  });

  it("returns null for text that is not a token", () => {
    expect(readTokenExpiry("")).toBeNull();
    expect(readTokenExpiry("not-a-token")).toBeNull();
    expect(readTokenExpiry("a.%%%.c")).toBeNull();
  });

  it("returns null when exp is missing", () => {
    expect(readTokenExpiry(tokenWith({ sub: "u1" }))).toBeNull();
  });
});

describe("isAuthPage", () => {
  it("matches the auth pages and their children", () => {
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/sign-up")).toBe(true);
    expect(isAuthPage("/register")).toBe(true);
  });

  it("does not match other pages", () => {
    expect(isAuthPage("/")).toBe(false);
    expect(isAuthPage("/reviews")).toBe(false);
    expect(isAuthPage("/login-help")).toBe(false);
  });
});

describe("decideRoute", () => {
  it("sends a visitor without a session to log in", () => {
    expect(decideRoute("/reviews", undefined, NOW)).toEqual({
      action: "redirect",
      to: "/login",
      clearSession: false,
    });
  });

  it("lets a visitor without a session open the login page", () => {
    expect(decideRoute("/login", undefined, NOW)).toEqual({
      action: "next",
      clearSession: false,
    });
  });

  it("lets a logged-in user open a workspace page", () => {
    expect(decideRoute("/reviews", VALID, NOW)).toEqual({
      action: "next",
      clearSession: false,
    });
  });

  it("sends a logged-in user away from the login page", () => {
    expect(decideRoute("/login", VALID, NOW)).toEqual({
      action: "redirect",
      to: "/",
      clearSession: false,
    });
  });

  it("treats an expired cookie as no session and clears it", () => {
    expect(decideRoute("/reviews", EXPIRED, NOW)).toEqual({
      action: "redirect",
      to: "/login",
      clearSession: true,
    });
    expect(decideRoute("/login", EXPIRED, NOW)).toEqual({
      action: "next",
      clearSession: true,
    });
  });

  it("treats an unreadable cookie as no session and clears it", () => {
    expect(decideRoute("/", "garbage", NOW)).toEqual({
      action: "redirect",
      to: "/login",
      clearSession: true,
    });
  });
});
