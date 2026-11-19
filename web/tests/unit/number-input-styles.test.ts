import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The tests run from the web folder.
const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("number inputs", () => {
  it("hide the spin arrows in every browser, for every number input", () => {
    expect(css).toMatch(/input\[type="number"\]\s*\{[^}]*appearance:\s*textfield/);
    expect(css).toMatch(/input\[type="number"\]::-webkit-inner-spin-button/);
    expect(css).toMatch(/input\[type="number"\]::-webkit-outer-spin-button/);
  });
});
