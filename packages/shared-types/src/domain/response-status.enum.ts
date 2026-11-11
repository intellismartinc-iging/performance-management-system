import { z } from "zod";

/**
 * Source: CHECK on pms.assignment_responses.status in packages/database/schema.sql.
 */
export const RESPONSE_STATUSES = ["draft", "submitted"] as const;

export const responseStatusSchema = z.enum(RESPONSE_STATUSES);
export type ResponseStatus = z.infer<typeof responseStatusSchema>;
