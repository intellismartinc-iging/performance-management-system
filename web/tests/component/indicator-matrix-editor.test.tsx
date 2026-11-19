import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  KpiGoalTemplateEditor,
  type Indicator,
  type KpiGoalTemplate,
  type SaveIntent,
} from "@/features/review-templates/components/kpi-goal-template-editor";
import {
  matrixOfKind,
  noMatrix,
  type IndicatorMatrix,
} from "@/features/review-templates/services/indicator-matrix";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const POSITIONS = [{ value: "12", label: "Engineering Manager" }];

function indicator(overrides: Partial<Indicator> = {}): Indicator {
  return {
    id: "indicator-1",
    name: "Delivery rate",
    description: "",
    unit: "Percentage",
    direction: "higher_is_better",
    target: "90",
    weight: "100",
    scoreMet: "5",
    scoreBelow: "2",
    matrix: noMatrix(),
    ...overrides,
  };
}

function renderEditor(matrix: IndicatorMatrix, extra: Partial<Indicator> = {}) {
  const onSave = vi.fn<(template: KpiGoalTemplate, intent: SaveIntent) => void>();
  render(
    <KpiGoalTemplateEditor
      positions={POSITIONS}
      backHref="/reviews/templates/kpi-goal-template"
      onSave={onSave}
      initialTemplate={{
        name: "Engineering Manager Performance Goals",
        description: "",
        position: "12",
        indicators: [indicator({ matrix, ...extra })],
      }}
    />,
  );
  return onSave;
}

const higherScale = () => matrixOfKind("scale", "higher_is_better", 90);
const lowerScale = () => matrixOfKind("scale", "lower_is_better", 10);
const table = () => matrixOfKind("table", "higher_is_better", 90);

beforeEach(() => vi.clearAllMocks());

describe("the indicator matrix section", () => {
  it("offers no matrix by default, and shows nothing else", () => {
    renderEditor(noMatrix());

    expect(screen.getByRole("combobox", { name: "Indicator matrix" })).toHaveTextContent("No matrix");
    expect(screen.queryByLabelText("Matrix title")).toBeNull();
    expect(screen.queryByText("Boundary score preview")).toBeNull();
  });

  it("starts a new matrix of the chosen kind, by direction and target", async () => {
    const user = userEvent.setup();
    renderEditor(noMatrix());

    await user.click(screen.getByRole("combobox", { name: "Indicator matrix" }));
    await user.click(await screen.findByRole("option", { name: "Numeric threshold scale" }));

    expect(screen.getByLabelText("Matrix title")).toHaveValue("Numeric threshold scale");
    expect(screen.getByLabelText("Minimum actual, row 2")).toHaveValue(90);
  });
});

describe("a numeric threshold scale", () => {
  it("shows the title, the threshold type, the rows, and the scoring switch", () => {
    renderEditor(higherScale());

    expect(screen.getByLabelText("Matrix title")).toHaveValue("Numeric threshold scale");
    expect(screen.getByRole("combobox", { name: /threshold type/i })).toHaveTextContent(
      "Minimum actual (inclusive)",
    );
    expect(screen.getByLabelText("Minimum actual, row 1")).toHaveValue(0);
    expect(screen.getByLabelText("Rating label, row 2")).toHaveValue("Target met");
    expect(screen.getByLabelText("Score, row 2")).toHaveValue(5);
    expect(screen.getByRole("checkbox", { name: "Use for scoring" })).not.toBeChecked();
    expect(screen.getByText(/Reference only/)).toBeTruthy();
  });

  it("scores zero, just below, exactly at, and just above the target in a preview", () => {
    renderEditor(higherScale());

    const preview = screen.getByRole("region", { name: "Boundary score preview" });
    const rows = within(preview).getAllByRole("row").slice(1);
    expect(rows.map((row) => within(row).getAllByRole("cell")[0]?.textContent)).toEqual([
      "Zero",
      "Below target",
      "Exact target",
      "Above target",
    ]);
    expect(rows.map((row) => within(row).getAllByRole("cell")[2]?.textContent)).toEqual([
      "1/5",
      "1/5",
      "5/5",
      "5/5",
    ]);
  });

  it("scores a maximum scale by its maximums, and the preview follows an edit", async () => {
    const user = userEvent.setup();
    renderEditor(lowerScale(), { direction: "lower_is_better", target: "10" });

    const preview = () => screen.getByRole("region", { name: "Boundary score preview" });
    const scores = () =>
      within(preview())
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getAllByRole("cell")[2]?.textContent);
    expect(scores()).toEqual(["5/5", "5/5", "5/5", "1/5"]);

    const maximum = screen.getByLabelText("Maximum actual, row 1");
    await user.clear(maximum);
    await user.type(maximum, "5");

    // Zero is at or below 5. Just below the target of 10 is above 5, so it falls in the final row.
    expect(scores()).toEqual(["5/5", "1/5", "1/5", "1/5"]);
  });

  it("marks the final row of a maximum scale as having no upper limit, and keeps it", () => {
    renderEditor(lowerScale());

    expect(screen.getByText("No upper limit")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove row 2" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove row 1" })).toBeEnabled();
  });

  it("adds a row before the unbounded final row, and removes a row", async () => {
    const user = userEvent.setup();
    renderEditor(lowerScale());

    await user.click(screen.getByRole("button", { name: "Add row" }));

    expect(screen.getByLabelText("Maximum actual, row 2")).toHaveValue(null);
    expect(screen.getByText("No upper limit")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Remove row 2" }));

    expect(screen.queryByLabelText("Maximum actual, row 2")).toBeNull();
  });

  it("says the scale sets the score, and drops the target-met hint, when it scores", async () => {
    const user = userEvent.setup();
    renderEditor(higherScale());

    expect(screen.getByText(/At or above the target earns 5\/5/)).toBeTruthy();
    await user.click(screen.getByRole("checkbox", { name: "Use for scoring" }));

    expect(
      screen.getByText(
        "Numeric matrix thresholds determine this indicator’s score. The target remains an achievement reference.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/At or above the target earns 5\/5/)).toBeNull();
  });

  it("links the matrix error to the matrix select", async () => {
    const user = userEvent.setup();
    const matrix = higherScale();
    matrix.scaleRows[0]!.threshold = "5";
    renderEditor(matrix);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    const select = screen.getByRole("combobox", { name: "Indicator matrix" });
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription(/Scale rows need a label/);
  });

  it("explains what scoring does, and sends the switch with the template", async () => {
    const user = userEvent.setup();
    const onSave = renderEditor(higherScale());

    await user.click(screen.getByRole("checkbox", { name: "Use for scoring" }));
    expect(screen.getByText(/replaces target-met \/ below-target scoring/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(onSave.mock.calls[0]?.[0].indicators[0]?.matrix).toMatchObject({
      kind: "scale",
      scoring: true,
    });
  });

  it("warns when the scores fight the direction, and still saves", async () => {
    const user = userEvent.setup();
    const matrix = higherScale();
    matrix.scaleRows[0]!.score = "5";
    matrix.scaleRows[1]!.score = "1";
    const onSave = renderEditor(matrix);

    expect(screen.getByRole("status")).toHaveTextContent(/conflicts with the indicator/i);
    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(onSave).toHaveBeenCalled();
  });

  it("reports an invalid scale in the words of the legacy builder, and does not save", async () => {
    const user = userEvent.setup();
    const matrix = higherScale();
    matrix.scaleRows[0]!.threshold = "5";
    const onSave = renderEditor(matrix);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(
      screen.getAllByText(
        "Indicator 1: Scale rows need a label, a score from 1 to 5, and distinct increasing nonnegative minimums starting at 0.",
      ).length,
    ).toBeGreaterThan(0);
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe("a custom reference table", () => {
  it("shows the columns and the cells, and says it never scores", () => {
    renderEditor(table());

    expect(screen.getByLabelText("Column 1 label")).toHaveValue("Criteria");
    expect(screen.getByLabelText("Row 1, column 2")).toHaveValue("");
    expect(screen.getByText(/does not change scoring/i)).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Use for scoring" })).toBeNull();
  });

  it("adds a row and a column, and removes a column with its cells", async () => {
    const user = userEvent.setup();
    renderEditor(table());

    await user.click(screen.getByRole("button", { name: "Add row" }));
    await user.click(screen.getByRole("button", { name: "Add column" }));
    expect(screen.getByLabelText("Row 2, column 3")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Remove column 1" }));
    expect(screen.queryByLabelText("Row 2, column 3")).toBeNull();
    expect(screen.getByLabelText("Column 1 label")).toHaveValue("Guidance");
  });

  it("sends the table cells the user typed", async () => {
    const user = userEvent.setup();
    const onSave = renderEditor(table());

    await user.type(screen.getByLabelText("Row 1, column 1"), "Quality");
    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(onSave.mock.calls[0]?.[0].indicators[0]?.matrix.rows).toEqual([["Quality", ""]]);
  });

  it("asks for a matrix title", async () => {
    const user = userEvent.setup();
    const matrix = { ...table(), title: "  " };
    const onSave = renderEditor(matrix);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(screen.getAllByText("Indicator 1: Enter a matrix title.").length).toBeGreaterThan(0);
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe("previewing the matrix", () => {
  it("shows the scale as text, with no controls, and what it is for", async () => {
    const user = userEvent.setup();
    renderEditor(higherScale());

    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(screen.queryByLabelText("Matrix title")).toBeNull();
    expect(screen.queryByRole("button", { name: "Add row" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove row 1" })).toBeNull();
    const matrix = within(screen.getByRole("region", { name: "Indicator matrix" }));
    expect(matrix.getByText("Numeric threshold scale")).toBeTruthy();
    expect(matrix.getByText("Reference only")).toBeTruthy();
    expect(matrix.getByText("Target met")).toBeTruthy();
    expect(matrix.getByRole("region", { name: "Boundary score preview" })).toBeTruthy();
  });

  it("says a scale is used for scoring when it is", async () => {
    const user = userEvent.setup();
    renderEditor({ ...higherScale(), scoring: true });

    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(screen.getByText("Used for scoring")).toBeTruthy();
  });

  it("shows a reference table as text, and shows no matrix as nothing", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<span />);
    unmount();
    renderEditor({ ...table(), rows: [["Quality", "No defects"]] });

    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(screen.getByText("No defects")).toBeTruthy();
    expect(screen.getByText("Criteria")).toBeTruthy();
  });
});
