import { z } from "zod";

/**
 * Source: role codes; the UI collapses these into WorkspaceRole.
 */
export const ROLE_CODES = [
  "system_admin",
  "hr_admin",
  "manager",
  "employee",
] as const;

export const roleCodeSchema = z.enum(ROLE_CODES);
export type RoleCode = z.infer<typeof roleCodeSchema>;
