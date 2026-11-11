import { z } from "zod";
import {
  dateOnlySchema,
  idSchema,
  nonNegativeInputSchema,
  requiredTextSchema,
} from "../common.js";
import {
  accomplishmentActualsRowSchema,
  accomplishmentVersionsRowSchema,
  accomplishmentsRowSchema,
  assignmentResponsesRowSchema,
  assignmentsRowSchema,
  auditEventsRowSchema,
  cycleParticipantsRowSchema,
  evaluationSnapshotsRowSchema,
  journalEntriesRowSchema,
} from "../rows/index.js";

/**
 * One employee's review inside one cycle: the cycle participant, with the
 * finalized snapshot once there is one.
 */
export const evaluationDtoSchema = cycleParticipantsRowSchema.extend({
  snapshot: evaluationSnapshotsRowSchema.nullable().optional(),
});
export type EvaluationDto = z.infer<typeof evaluationDtoSchema>;

/** One evaluator's assignment for one participant and stage. */
export const evaluatorAssignmentDtoSchema = assignmentsRowSchema;
export type EvaluatorAssignmentDto = z.infer<
  typeof evaluatorAssignmentDtoSchema
>;

/** The reported actual of one indicator. */
export const indicatorResultDtoSchema = accomplishmentActualsRowSchema;
export type IndicatorResultDto = z.infer<typeof indicatorResultDtoSchema>;

/** One submitted revision of an accomplishment. */
export const accomplishmentSubmissionDtoSchema =
  accomplishmentVersionsRowSchema;
export type AccomplishmentSubmissionDto = z.infer<
  typeof accomplishmentSubmissionDtoSchema
>;

export const accomplishmentDtoSchema = accomplishmentsRowSchema.extend({
  /** ASSUMPTION: the API embeds the actuals. */
  actuals: z.array(accomplishmentActualsRowSchema).optional(),
});
export type AccomplishmentDto = z.infer<typeof accomplishmentDtoSchema>;

/** A behavioral assessment is one response row; the answers are in `answersJson`. */
export const behavioralAssessmentDtoSchema = assignmentResponsesRowSchema;
export type BehavioralAssessmentDto = z.infer<
  typeof behavioralAssessmentDtoSchema
>;

export const evaluationHistoryDtoSchema = auditEventsRowSchema;
export type EvaluationHistoryDto = z.infer<typeof evaluationHistoryDtoSchema>;

export const journalEntryDtoSchema = journalEntriesRowSchema;
export type JournalEntryDto = z.infer<typeof journalEntryDtoSchema>;

/** Matches `KpiReportingForm.onSave`. Remarks belong to the accomplishment. */
export const reportIndicatorActualsRequestSchema = z.object({
  actuals: z.array(
    z.object({
      indicatorId: idSchema,
      actualValue: nonNegativeInputSchema.nullable(),
    }),
  ),
  remarks: z.string().trim().default(""),
});
export type ReportIndicatorActualsRequestDto = z.infer<
  typeof reportIndicatorActualsRequestSchema
>;

/** Behavioral answers. Mirrors the database CHECK rules on responses. */
const behavioralAnswerRequestSchema = z
  .object({
    questionId: idSchema,
    score: z.number().min(1).max(5).nullable().default(null),
    writtenAnswer: z.string().trim().nullable().default(null),
    isNotObserved: z.boolean().default(false),
  })
  .superRefine((answer, ctx) => {
    if (
      answer.isNotObserved &&
      (answer.score !== null || answer.writtenAnswer)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "A not-observed answer cannot have a score or text.",
        path: ["isNotObserved"],
      });
    }
    if (answer.score !== null && answer.writtenAnswer) {
      ctx.addIssue({
        code: "custom",
        message: "Give a score or written text, not both.",
        path: ["writtenAnswer"],
      });
    }
  });

/**
 * `answers` is stored as `answers_json`. pms.assignment_responses has no
 * feedback column, so the form's overall feedback is not sent.
 */
export const submitBehavioralAssessmentRequestSchema = z.object({
  answers: z.array(behavioralAnswerRequestSchema),
});
export type SubmitBehavioralAssessmentRequestDto = z.infer<
  typeof submitBehavioralAssessmentRequestSchema
>;

export const createJournalEntryRequestSchema = z.object({
  employeeId: idSchema,
  entryDate: dateOnlySchema,
  entryType: requiredTextSchema,
  title: requiredTextSchema,
  description: requiredTextSchema,
  cycleId: idSchema.nullable().default(null),
});
export type CreateJournalEntryRequestDto = z.infer<
  typeof createJournalEntryRequestSchema
>;
