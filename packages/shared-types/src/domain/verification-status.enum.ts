import { z } from "zod";

/**
 * Source: the same lifecycle as pms.accomplishments.status.
 */
export const VERIFICATION_STATUSES = [
  "draft",
  "submitted",
  "returned",
  "verified",
] as const;

export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
