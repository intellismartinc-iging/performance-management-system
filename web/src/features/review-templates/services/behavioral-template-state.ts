import type {
  Question,
  Section,
} from "@/features/review-templates/components/behavioral-template-editor";
import type { BehavioralTemplate } from "@/features/review-templates/components/behavioral-template-editor";

/** A new rating question: the legacy builder starts with one. */
export function newQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    title: "",
    type: "rating_scale",
    choices: [],
    required: true,
    notObserved: false,
  };
}

export function newSection(): Section {
  return { id: crypto.randomUUID(), name: "", questions: [newQuestion()] };
}

/** An empty builder: no name, one section with one question, and the first category and review type. */
export function newBehavioralTemplate(): BehavioralTemplate {
  return {
    name: "",
    description: "",
    category: "general_performance",
    reviewType: "self",
    sections: [newSection()],
  };
}

/** The list with the item at `index` moved by `by` places. A move past either end changes nothing. */
export function moveItem<Item>(list: readonly Item[], index: number, by: -1 | 1): Item[] {
  const target = index + by;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) {
    return [...list];
  }
  const moved = [...list];
  [moved[index], moved[target]] = [moved[target]!, moved[index]!];
  return moved;
}

/** Two empty options when a question becomes multiple choice: the inputs show "Option 1" and "Option 2" as placeholders only. */
export const DEFAULT_CHOICES = ["", ""] as const;

/** The questions with a copy of the question `id`, with a new id, right after it. */
export function duplicateQuestion(questions: readonly Question[], id: string): Question[] {
  const index = questions.findIndex((question) => question.id === id);
  if (index < 0) return [...questions];
  const copy = { ...questions[index]!, id: crypto.randomUUID(), choices: [...questions[index]!.choices] };
  return [...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)];
}
