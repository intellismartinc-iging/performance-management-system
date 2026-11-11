import { z } from "zod";

/**
 * Source: CHECK on pms.notifications.source_type in packages/database/schema.sql.
 */
export const NOTIFICATION_SOURCE_TYPES = ["assignment", "nte", "pip"] as const;

export const notificationSourceTypeSchema = z.enum(NOTIFICATION_SOURCE_TYPES);
export type NotificationSourceType = z.infer<
  typeof notificationSourceTypeSchema
>;
