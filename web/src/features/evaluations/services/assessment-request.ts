import { submitBehavioralAssessmentRequestSchema } from "@pms/shared-types";

import type { ReviewSection } from "@/types/review-question";

interface Answer {
  questionId: string;
  score?: number;
  writtenAnswer?: string;
}

/**
 * The scoring form keeps answers as text by question id. The API takes a score
 * for a rating scale question and written text for the other types. A question
 * with no answer is left out. The form's overall feedback has no column in
 * pms.assignment_responses, so it is not sent.
 */
export function toSubmitBehavioralAssessmentRequest(
  sections: readonly ReviewSection[],
  answers: Readonly<Record<string, string>>,
) {
  const responses: Answer[] = [];
  for (const { questions } of sections) {
    for (const question of questions) {
      const answer = answers[question.id]?.trim() ?? "";
      if (!answer) continue;
      responses.push(
        question.type === "rating_scale"
          ? { questionId: question.id, score: Number(answer) }
          : { questionId: question.id, writtenAnswer: answer },
      );
    }
  }
  return submitBehavioralAssessmentRequestSchema.safeParse({
    answers: responses,
  });
}
