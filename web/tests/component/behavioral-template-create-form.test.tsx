import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BehavioralTemplateCreateForm } from "@/features/review-templates/components/behavioral-template-create-form";
import { createBehavioralTemplate } from "@/features/review-templates/services/save-behavioral-template";

vi.mock("@/features/review-templates/services/save-behavioral-template", () => ({
  createBehavioralTemplate: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeEach(() => {
  vi.mocked(createBehavioralTemplate).mockReset().mockResolvedValue({ message: "" });
});

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/template name/i), "Quarterly Review");
  await user.type(screen.getByLabelText(/section title/i), "Job Performance");
  await user.type(screen.getByLabelText(/question title/i), "Meets deadlines?");
}

describe("BehavioralTemplateCreateForm", () => {
  it("shows the builder like the legacy form: details, one section, and one rating question", () => {
    render(<BehavioralTemplateCreateForm />);

    expect(screen.getByRole("heading", { name: "Behavioral Assessment Template Builder" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /back to behavioral assessment templates/i })).toBeTruthy();
    expect(screen.getByLabelText(/template name/i)).toBeTruthy();
    expect(screen.getByLabelText(/description/i)).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /template category/i })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /review type/i })).toBeTruthy();
    expect(screen.getByLabelText(/section title/i)).toBeTruthy();
    expect(screen.getByLabelText(/question title/i)).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Required" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Allow Not Observed" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Preview" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save as Draft" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Publish Template" })).toBeTruthy();
  });

  it.each([
    ["Template Category", "Others"],
    ["Review Type", "Others"],
  ])("lists Others last in the %s select, as a label with no input of its own", async (name, others) => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);

    await user.click(screen.getByRole("combobox", { name: new RegExp(name, "i") }));
    const options = (await screen.findAllByRole("option")).map((option) => option.textContent);

    expect(options.at(-1)).toBe(others);
    expect(screen.queryByRole("textbox", { name: /other/i })).toBeNull();
  });

  it("lists the review types in order: Self, Manager, Peer, Upward, HR, Others", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);

    await user.click(screen.getByRole("combobox", { name: /review type/i }));
    const options = (await screen.findAllByRole("option")).map((option) => option.textContent);

    expect(options).toEqual(["Self", "Manager", "Peer", "Upward", "HR", "Others"]);
  });

  it("saves a draft with the exact body the API takes", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    await fillRequired(user);
    await user.type(screen.getByLabelText(/description/i), "Reflect on behaviors.");

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(createBehavioralTemplate).toHaveBeenCalledWith(
      {
        name: "Quarterly Review",
        description: "Reflect on behaviors.",
        category: "general_performance",
        reviewType: "self",
        sections: [
          {
            title: "Job Performance",
            questions: [{ prompt: "Meets deadlines?", questionType: "rating_scale", isRequired: true, allowNotObserved: false }],
          },
        ],
      },
      "draft",
    );
  });

  it("sends allowNotObserved when the box is ticked, and publishes with the publish intent", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    await fillRequired(user);
    await user.click(screen.getByRole("checkbox", { name: "Allow Not Observed" }));

    await user.click(screen.getByRole("button", { name: "Publish Template" }));

    expect(createBehavioralTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [expect.objectContaining({ questions: [expect.objectContaining({ allowNotObserved: true })] })],
      }),
      "publish",
    );
  });

  it("asks for the template name before it calls the server", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(createBehavioralTemplate).not.toHaveBeenCalled();
    expect(await screen.findAllByText("Enter a template name.")).not.toHaveLength(0);
  });

  it("shows the reason on the form when the server refuses, and keeps what the user typed", async () => {
    vi.mocked(createBehavioralTemplate).mockResolvedValue({ message: "Only HR administrators can create behavioral assessment templates." });
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    await fillRequired(user);

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect((await screen.findAllByText(/Only HR administrators/)).length).toBeGreaterThan(0);
    expect((screen.getByLabelText(/question title/i) as HTMLInputElement).value).toBe("Meets deadlines?");
  });

  it("adds a section and a question, and moves a question up", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    await user.click(screen.getByRole("button", { name: /add question to section/i }));
    const titles = screen.getAllByLabelText(/question title/i);
    await user.type(titles[1]!, "Second");

    await user.click(screen.getAllByRole("button", { name: "Move question up" })[1]!);

    expect((screen.getAllByLabelText(/question title/i)[0] as HTMLInputElement).value).toBe("Second");
    await user.click(screen.getByRole("button", { name: /add section/i }));
    expect(screen.getAllByLabelText(/section title/i)).toHaveLength(2);
  });

  async function chooseMultipleChoice(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("combobox", { name: /question type/i }));
    await user.click(within(await screen.findByRole("listbox")).getByRole("option", { name: "Multiple choice" }));
  }

  it("shows one input per answer option, with Option 1 and Option 2 to start, only for multiple choice", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    expect(screen.queryByRole("button", { name: /add answer option/i })).toBeNull();

    await chooseMultipleChoice(user);

    // "Option 1" and "Option 2" are placeholders, not values: the user types the real answers.
    expect((screen.getByLabelText("Option 1") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Option 2") as HTMLInputElement).value).toBe("");
    expect(screen.getByPlaceholderText("Option 1")).toBeTruthy();
    expect(screen.getByPlaceholderText("Option 2")).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: /options \(one per line\)/i })).toBeNull();
    expect(screen.getByRole("button", { name: /add answer option/i })).toBeTruthy();
  });

  it("adds and removes answer options, and sends them in order as choice options", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    await fillRequired(user);
    await chooseMultipleChoice(user);
    await user.clear(screen.getByLabelText("Option 1"));
    await user.type(screen.getByLabelText("Option 1"), "Daily");
    await user.clear(screen.getByLabelText("Option 2"));
    await user.type(screen.getByLabelText("Option 2"), "Weekly");
    await user.click(screen.getByRole("button", { name: /add answer option/i }));
    await user.type(screen.getByLabelText("Option 3"), "Monthly");
    await user.click(screen.getByRole("button", { name: "Remove option 3" }));
    expect(screen.queryByLabelText("Option 3")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));

    expect(createBehavioralTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [
          expect.objectContaining({
            questions: [
              expect.objectContaining({
                questionType: "multiple_choice",
                choiceOptions: [{ label: "Daily" }, { label: "Weekly" }],
              }),
            ],
          }),
        ],
      }),
      "draft",
    );
  });

  it("refuses two equal options, and an empty option, before it calls the server", async () => {
    const user = userEvent.setup();
    render(<BehavioralTemplateCreateForm />);
    await fillRequired(user);
    await chooseMultipleChoice(user);
    await user.type(screen.getByLabelText("Option 1"), "Daily");
    await user.type(screen.getByLabelText("Option 2"), "daily");

    await user.click(screen.getByRole("button", { name: "Save as Draft" }));
    expect((await screen.findAllByText(/at least two different options/i)).length).toBeGreaterThan(0);

    await user.clear(screen.getByLabelText("Option 2"));
    await user.click(screen.getByRole("button", { name: "Save as Draft" }));
    expect((await screen.findAllByText(/empty option/i)).length).toBeGreaterThan(0);
    expect(createBehavioralTemplate).not.toHaveBeenCalled();
  });
});
