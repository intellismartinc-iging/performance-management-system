import { z } from "zod";
import { dateOnlySchema, idSchema, requiredTextSchema } from "../common.js";
import {
  auditEventsRowSchema,
  nteNoticesRowSchema,
  nteReadReceiptsRowSchema,
} from "../rows/index.js";

/** Length limits match the database CHECK rules. */
const SUBJECT_MAX = 200;
const BODY_MAX = 20_000;

/** The employee's explanation is in `explanationText` on the notice itself. */
export const nteNoticeDtoSchema = nteNoticesRowSchema;
export type NteNoticeDto = z.infer<typeof nteNoticeDtoSchema>;

export const nteReadReceiptDtoSchema = nteReadReceiptsRowSchema;
export type NteReadReceiptDto = z.infer<typeof nteReadReceiptDtoSchema>;

export const nteHistoryDtoSchema = auditEventsRowSchema;
export type NteHistoryDto = z.infer<typeof nteHistoryDtoSchema>;

/** Save draft or issue. Issue the same body; the server sets the status. */
export const saveNteRequestSchema = z.object({
  employeeId: idSchema,
  category: requiredTextSchema,
  subject: requiredTextSchema.max(SUBJECT_MAX),
  body: requiredTextSchema.max(BODY_MAX),
  explanationDeadline: dateOnlySchema,
  incidentDate: dateOnlySchema.nullable().default(null),
  incidentReference: z.string().trim().nullable().default(null),
});
export type SaveNteRequestDto = z.infer<typeof saveNteRequestSchema>;

/** "Submit Explanation?" */
export const respondToNteRequestSchema = z.object({
  explanationText: requiredTextSchema.max(BODY_MAX),
});
export type RespondToNteRequestDto = z.infer<typeof respondToNteRequestSchema>;

export const closeNteRequestSchema = z.object({
  /** Required by the "Early Closure Exception" dialog when closing before the deadline. */
  earlyCloseReason: z.string().trim().min(1).optional(),
});
export type CloseNteRequestDto = z.infer<typeof closeNteRequestSchema>;

export const cancelNteRequestSchema = z.object({
  cancelReason: requiredTextSchema,
});
export type CancelNteRequestDto = z.infer<typeof cancelNteRequestSchema>;
