import { z } from "zod";

/**
 * Source: CHECK on pms.cycles.state in packages/database/schema.sql.
 */
export const CYCLE_STATUSES = [
  "draft",
  "scheduled",
  "active",
  "completed",
  "cancelled",
] as const;

export const cycleStatusSchema = z.enum(CYCLE_STATUSES);
export type CycleStatus = z.infer<typeof cycleStatusSchema>;
