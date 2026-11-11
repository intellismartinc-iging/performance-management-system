import { z } from "zod";
import {
  notificationPreferencesRowSchema,
  notificationsRowSchema,
} from "../rows/index.js";

/** `sourceType` and `sourceId` link a notification to an assignment, notice, or plan. */
export const notificationDtoSchema = notificationsRowSchema;
export type NotificationDto = z.infer<typeof notificationDtoSchema>;

export const notificationPreferencesDtoSchema =
  notificationPreferencesRowSchema;
export type NotificationPreferencesDto = z.infer<
  typeof notificationPreferencesDtoSchema
>;

export const updateNotificationPreferencesRequestSchema = z.object({
  isReviewNotificationsEnabled: z.boolean(),
});
export type UpdateNotificationPreferencesRequestDto = z.infer<
  typeof updateNotificationPreferencesRequestSchema
>;
