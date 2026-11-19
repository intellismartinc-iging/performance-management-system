import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  KpiGoalTemplateEditor,
  type KpiGoalTemplate,
} from "@/features/review-templates/components/kpi-goal-template-editor";
import { noMatrix } from "@/features/review-templates/services/indicator-matrix";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const POSITIONS = [{ value: "12", label: "Engineering Manager" }];
const SERVER_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const TEMPLATE: KpiGoalTemplate = {
  name: "Engineering Manager Goals",
  position: "12",
  description: "",
  indicators: [
    {
      id: SERVER_ID,
      name: "Delivery rate",
      description: "",
      unit: "Percentage",
      direction: "higher_is_better",
      target: "90",
      weight: "100",
      scoreMet: "5",
      scoreBelow: "2",
      matrix: noMatrix(),
    },
  ],
};

function renderEditor(props: Partial<Parameters<typeof KpiGoalTemplateEditor>[0]> = {}) {
  const onSave = vi.fn();
  render(
    <KpiGoalTemplateEditor
      initialTemplate={TEMPLATE}
      positions={POSITIONS}
      backHref="/list"
      onSave={onSave}
      {...props}
    />,
  );
  return onSave;
}

const unit = () => screen.getByRole("combobox", { name: /measurement unit/i });
const direction = () => screen.getByRole("combobox", { name: /achievement direction/i });

describe("the details page", () => {
  it("shows the template read-only with the header actions it is given", () => {
    renderEditor({ readOnly: true, headerActions: <button type="button">Edit Template</button> });

    expect(screen.getByRole("heading", { level: 1, name: "KPI Goal Template Details" })).toBeTruthy();
    expect(screen.getByText("Configure measurable performance outcomes and explicit scoring criteria.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Template" })).toBeTruthy();
    for (const name of ["Preview", "Save as Draft", "Publish Template", "Update Template"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
    expect(screen.getByRole("link", { name: /back to kpi goal templates/i })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: /template name/i })).toBeNull();
  });
});

describe("editing a draft", () => {
  it("keeps Save as Draft and Publish Template, and leaves every field open", () => {
    renderEditor({ status: "draft" });

    expect(screen.getByRole("heading", { level: 1, name: "Edit KPI Goal Template" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save as Draft" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Publish Template" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Update Template" })).toBeNull();
    expect(unit().hasAttribute("disabled")).toBe(false);
    expect(direction().hasAttribute("disabled")).toBe(false);
  });
});

describe("editing a published template", () => {
  it("shows Update Template instead of the draft buttons", () => {
    renderEditor({ status: "published" });

    expect(screen.getByRole("button", { name: "Update Template" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Publish Template" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save as Draft" })).toBeNull();
  });

  it("locks the unit and direction of a saved indicator, and nothing else", () => {
    renderEditor({ status: "published" });

    expect(unit().hasAttribute("disabled")).toBe(true);
    expect(direction().hasAttribute("disabled")).toBe(true);
    expect((screen.getByLabelText("Target Value") as HTMLInputElement).disabled).toBe(false);
    expect((screen.getByLabelText("Weight (%)") as HTMLInputElement).disabled).toBe(false);
  });

  it("leaves the unit and direction of a new indicator open", async () => {
    const user = userEvent.setup();
    renderEditor({ status: "published" });

    await user.click(screen.getByRole("button", { name: "Add indicator" }));

    const units = screen.getAllByRole("combobox", { name: /measurement unit/i });
    expect(units[0]?.hasAttribute("disabled")).toBe(true);
    expect(units[1]?.hasAttribute("disabled")).toBe(false);
  });

  it("saves with the update intent once the weights total 100", async () => {
    const user = userEvent.setup();
    const onSave = renderEditor({ status: "published" });

    await user.click(screen.getByRole("button", { name: "Update Template" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "Engineering Manager Goals" }), "update");
  });

  it("holds the update until the weights total 100", async () => {
    const user = userEvent.setup();
    const onSave = renderEditor({
      status: "published",
      initialTemplate: {
        ...TEMPLATE,
        indicators: [{ ...TEMPLATE.indicators[0]!, weight: "60" }],
      },
    });

    await user.click(screen.getByRole("button", { name: "Update Template" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/allocate the remaining 40%/i)).toBeTruthy();
  });
});
