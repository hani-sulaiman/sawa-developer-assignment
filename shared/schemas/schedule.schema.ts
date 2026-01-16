import { z } from 'zod';

export const DayOfWeekSchema = z.number().int().min(0).max(6);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ScheduleSlotSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  dayOfWeek: DayOfWeekSchema,
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.number().default(30),
  isActive: z.boolean().default(true),
});

export type ScheduleSlot = z.infer<typeof ScheduleSlotSchema>;

export const CreateScheduleSlotSchema = z.object({
  dayOfWeek: DayOfWeekSchema,
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  slotDuration: z.number().int().min(15).max(120).default(30),
  isActive: z.boolean().default(true),
});

export type CreateScheduleSlotInput = z.infer<typeof CreateScheduleSlotSchema>;

export const BlockedSlotSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  date: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  reason: z.string().nullable(),
  isFullDay: z.boolean(),
});

export type BlockedSlot = z.infer<typeof BlockedSlotSchema>;

export const CreateBlockedSlotSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
  isFullDay: z.boolean().default(false),
});

export type CreateBlockedSlotInput = z.infer<typeof CreateBlockedSlotSchema>;
