import { z } from "zod";

/**
 * Source: CHECK on pms.operational_goals.status in packages/database/schema.sql.
 */
export const GOAL_STATUSES = [
  "active",
  "pending_approval",
  "completed",
] as const;

export const goalStatusSchema = z.enum(GOAL_STATUSES);
export type GoalStatus = z.infer<typeof goalStatusSchema>;
