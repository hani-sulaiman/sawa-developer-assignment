import { z } from 'zod';

export const NotificationTypeSchema = z.enum([
  'appointment_confirmed',
  'appointment_rejected',
  'appointment_reminder',
  'new_appointment',
  'new_review',
  'new_message',
  'prescription_created',
  'general',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = z.object({
  userId: z.string().min(1),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.any()).optional(),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
