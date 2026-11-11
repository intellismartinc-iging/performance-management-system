import { z } from "zod";

/**
 * Source: CHECK on pms.operational_goals.tracking_mode in packages/database/schema.sql.
 */
export const GOAL_TRACKING_MODES = ["manual", "milestone"] as const;

export const goalTrackingModeSchema = z.enum(GOAL_TRACKING_MODES);
export type GoalTrackingMode = z.infer<typeof goalTrackingModeSchema>;
