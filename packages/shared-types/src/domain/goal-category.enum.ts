import { z } from "zod";

/**
 * Source: CHECK on pms.operational_goals.category in packages/database/schema.sql.
 */
export const GOAL_CATEGORIES = [
  "quality",
  "delivery",
  "growth",
  "collaboration",
] as const;

export const goalCategorySchema = z.enum(GOAL_CATEGORIES);
export type GoalCategory = z.infer<typeof goalCategorySchema>;
