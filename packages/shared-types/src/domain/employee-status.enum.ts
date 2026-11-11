import { z } from "zod";

/**
 * Source: CHECK on pms.employees.status in packages/database/schema.sql.
 */
export const EMPLOYEE_STATUSES = ["active", "inactive"] as const;

export const employeeStatusSchema = z.enum(EMPLOYEE_STATUSES);
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;
