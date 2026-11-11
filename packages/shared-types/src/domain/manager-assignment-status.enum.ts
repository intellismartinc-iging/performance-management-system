import { z } from "zod";

/**
 * Source: CHECK on pms.manager_assignments.status in packages/database/schema.sql.
 */
export const MANAGER_ASSIGNMENT_STATUSES = [
  "pending",
  "applied",
  "blocked",
  "cancelled",
] as const;

export const managerAssignmentStatusSchema = z.enum(
  MANAGER_ASSIGNMENT_STATUSES,
);
export type ManagerAssignmentStatus = z.infer<
  typeof managerAssignmentStatusSchema
>;
