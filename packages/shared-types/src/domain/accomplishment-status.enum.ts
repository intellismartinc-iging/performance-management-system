import { z } from "zod";

/**
 * Source: CHECK on pms.accomplishments.status in packages/database/schema.sql.
 */
export const ACCOMPLISHMENT_STATUSES = [
  "draft",
  "submitted",
  "returned",
  "verified",
] as const;

export const accomplishmentStatusSchema = z.enum(ACCOMPLISHMENT_STATUSES);
export type AccomplishmentStatus = z.infer<typeof accomplishmentStatusSchema>;
