import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GoalTemplateSavedNotice } from "@/features/review-templates/components/goal-template-saved-notice";

describe("GoalTemplateSavedNotice", () => {
  it.each([
    ["draft", /saved as a draft/i, "status"],
    ["published", /published/i, "status"],
    ["updated", /template updated/i, "status"],
    ["archived", /template archived/i, "status"],
    ["publish_failed", /not published/i, "alert"],
  ])("tells the user what happened after a %s save", (saved, text, role) => {
    render(<GoalTemplateSavedNotice saved={saved} />);

    expect(screen.getByRole(role).textContent).toMatch(text);
  });

  it.each([undefined, "", "other", ["draft", "published"]])(
    "shows nothing for %j",
    (saved) => {
      const { container } = render(<GoalTemplateSavedNotice saved={saved} />);

      expect(container.textContent).toBe("");
    },
  );
});
