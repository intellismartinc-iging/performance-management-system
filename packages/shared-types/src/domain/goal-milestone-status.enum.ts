import { z } from "zod";

/**
 * Source: CHECK on pms.goal_milestones.status in packages/database/schema.sql.
 */
export const GOAL_MILESTONE_STATUSES = [
  "pending",
  "completed",
  "completed_late",
  "overdue",
] as const;

export const goalMilestoneStatusSchema = z.enum(GOAL_MILESTONE_STATUSES);
export type GoalMilestoneStatus = z.infer<typeof goalMilestoneStatusSchema>;
