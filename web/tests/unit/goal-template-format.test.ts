import { describe, expect, it } from "vitest";
import {
  formatPosition,
  toPositionOptions,
} from "@/features/review-templates/services/goal-template-format";

describe("formatPosition", () => {
  it("shows the position text, or says the template has none", () => {
    expect(formatPosition("Software Engineer")).toBe("Software Engineer");
    expect(formatPosition(null)).toBe("No position");
  });
});

describe("toPositionOptions", () => {
  it("makes one option per position name, with the name as value and label", () => {
    expect(toPositionOptions(["Analyst", "Software Engineer"])).toEqual([
      { value: "Analyst", label: "Analyst" },
      { value: "Software Engineer", label: "Software Engineer" },
    ]);
  });

  it("keeps the position the template already has, even when no employee holds it", () => {
    expect(toPositionOptions(["Analyst"], "Retired Role")).toEqual([
      { value: "Analyst", label: "Analyst" },
      { value: "Retired Role", label: "Retired Role" },
    ]);
  });

  it("does not list the current position twice", () => {
    expect(toPositionOptions(["Analyst"], "Analyst")).toHaveLength(1);
  });

  it("lists only the current position when the names could not be read", () => {
    expect(toPositionOptions([], "Analyst")).toEqual([{ value: "Analyst", label: "Analyst" }]);
    expect(toPositionOptions([], null)).toEqual([]);
  });
});
