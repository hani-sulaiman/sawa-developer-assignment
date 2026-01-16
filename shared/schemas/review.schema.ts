import { z } from 'zod';

export const CreateReviewSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  appointmentId: z.string().min(1, 'Appointment is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const ReviewSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  appointmentId: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  createdAt: z.string(),
});

export type Review = z.infer<typeof ReviewSchema>;
