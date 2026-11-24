import type { BehavioralTemplateTreeResponseDto } from "@pms/shared-types";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BehavioralTemplateEditForm } from "@/features/review-templates/components/behavioral-template-edit-form";
import { saveBehavioralTemplateEdits } from "@/features/review-templates/services/manage-behavioral-template";

vi.mock("@/features/review-templates/services/manage-behavioral-template", () => ({
  saveBehavioralTemplateEdits: vi.fn(),
  publishBehavioralTemplate: vi.fn(),
}));

const id = (n: number) => `3f2504e0-4f89-41d3-9a0c-0305e82c33${String(n).padStart(2, "0")}`;
const PATH = "/reviews/templates/behavioral-assessment-template";

const TREE: BehavioralTemplateTreeResponseDto = {
  template: {
    templateId: id(1),
    company: "Mayon Consolidated Inc.",
    name: "Quarterly Performance Review",
    description: "Reflect on behaviors.",
    category: "peer_feedback",
    reviewType: "hr",
    status: "draft",
    currentVersion: 1,
    publishedBy: null,
    publishedAt: null,
    archivedAt: null,
    createdAt: "2026-11-24T06:00:00.000Z",
    updatedAt: "2026-11-24T06:00:00.000Z",
  },
  version: null,
  sections: [{ sectionId: id(10), versionId: id(2), title: "Job Performance", sortOrder: 0 }],
  questions: [
    { questionId: id(21), sectionId: id(10), prompt: "Meets deadlines?", questionType: "rating_scale", isRequired: true, allowNotObserved: true, sortOrder: 0 },
  ],
  options: [],
};

beforeEach(() => {
  vi.mocked(saveBehavioralTemplateEdits).mockReset().mockResolvedValue({ message: "" });
});

describe("BehavioralTemplateEditForm", () => {
  it("opens the draft with its stored values, and goes back to the details page", () => {
    render(<BehavioralTemplateEditForm tree={TREE} />);

    expect(screen.getByRole("heading", { name: "Edit Behavioral Assessment Template" })).toBeTruthy();
    expect((screen.getByLabelText(/template name/i) as HTMLInputElement).value).toBe("Quarterly Performance Review");
    expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe("Reflect on behaviors.");
    expect((screen.getByLabelText(/section title/i) as HTMLInputElement).value).toBe("Job Performance");
    expect((screen.getByLabelText(/question title/i) as HTMLInputElement).value).toBe("Meets deadlines?");
    expect((screen.getByRole("checkbox", { name: "Allow Not Observed" }) as HTMLElement).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("link", { name: /back to template details/i }).getAttribute("href")).toBe(`${PATH}/${id(1)}`);
  });

  it("saves the edits as a draft with the template id and the exact body", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateEditForm tree={TREE} />);
    await user.type(screen.getByLabelText(/template name/i), " v2");

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(saveBehavioralTemplateEdits).toHaveBeenCalledWith(
      id(1),
      {
        name: "Quarterly Performance Review v2",
        description: "Reflect on behaviors.",
        category: "peer_feedback",
        reviewType: "hr",
        sections: [
          {
            title: "Job Performance",
            questions: [{ prompt: "Meets deadlines?", questionType: "rating_scale", isRequired: true, allowNotObserved: true }],
          },
        ],
      },
      "draft",
    );
  });

  it("publishes with the publish intent", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateEditForm tree={TREE} />);

    await user.click(screen.getByRole("button", { name: "Publish Template" }));

    expect(saveBehavioralTemplateEdits).toHaveBeenCalledWith(id(1), expect.anything(), "publish");
  });

  describe("a published template", () => {
    const PUBLISHED: BehavioralTemplateTreeResponseDto = {
      ...TREE,
      template: { ...TREE.template, status: "published", currentVersion: 1 },
    };

    it("offers Preview and Update Template, with no draft buttons", () => {
      render(<BehavioralTemplateEditForm tree={PUBLISHED} />);

      expect(screen.getByRole("button", { name: "Preview" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Update Template" })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Save as Draft" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Publish Template" })).toBeNull();
    });

    it("asks first, because the update publishes the next version at once", async () => {
      const user = userEvent.setup();
      render(<BehavioralTemplateEditForm tree={PUBLISHED} />);

      await user.click(screen.getByRole("button", { name: "Update Template" }));

      const dialog = await screen.findByRole("alertdialog", { name: "Update this template?" });
      expect(dialog.textContent).toContain("This publishes version 2. Cycles that already use version 1 keep it.");
      expect(saveBehavioralTemplateEdits).not.toHaveBeenCalled();
    });

    it("sends the update intent once the user confirms, and nothing when the user cancels", async () => {
      const user = userEvent.setup();
      render(<BehavioralTemplateEditForm tree={PUBLISHED} />);

      await user.click(screen.getByRole("button", { name: "Update Template" }));
      await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancel" }));
      expect(saveBehavioralTemplateEdits).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Update Template" }));
      await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Update Template" }));

      expect(saveBehavioralTemplateEdits).toHaveBeenCalledWith(id(1), expect.objectContaining({ name: "Quarterly Performance Review" }), "update");
    });
  });

  it("shows the reason on the form when the server refuses, and keeps what the user typed", async () => {
    vi.mocked(saveBehavioralTemplateEdits).mockResolvedValue({ message: "Only draft templates can be updated." });
    const user = userEvent.setup();
    render(<BehavioralTemplateEditForm tree={TREE} />);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect((await screen.findAllByText("Only draft templates can be updated.")).length).toBeGreaterThan(0);
    expect((screen.getByLabelText(/question title/i) as HTMLInputElement).value).toBe("Meets deadlines?");
  });
});
