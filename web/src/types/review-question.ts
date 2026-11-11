import type { BehavioralQuestionType } from "@pms/shared-types";

export interface QuestionOption {
  value: string;
  label: string;
}

/** A question as an evaluator sees it. Template editors keep their own draft shape. */
export interface ReviewQuestion {
  id: string;
  title: string;
  required: boolean;
  type: BehavioralQuestionType;
  options?: readonly QuestionOption[];
}

export interface ReviewSection {
  id: string;
  name: string;
  questions: readonly ReviewQuestion[];
}
