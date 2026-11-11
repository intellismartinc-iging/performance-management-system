import { z } from "zod";

/**
 * Source: CHECK on pms.nte_notices.status in packages/database/schema.sql.
 */
export const NTE_STATUSES = [
  "draft",
  "issued",
  "responded",
  "closed",
  "cancelled",
] as const;

export const nteStatusSchema = z.enum(NTE_STATUSES);
export type NteStatus = z.infer<typeof nteStatusSchema>;
