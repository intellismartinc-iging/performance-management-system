import { z } from "zod";

/**
 * Source: CHECK on pms.kpi_goal_templates.status and pms.behavioral_templates.status in packages/database/schema.sql.
 */
export const TEMPLATE_VERSION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const templateVersionStatusSchema = z.enum(TEMPLATE_VERSION_STATUSES);
export type TemplateVersionStatus = z.infer<typeof templateVersionStatusSchema>;
