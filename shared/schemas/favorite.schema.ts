import { z } from 'zod';
import { DoctorSchema } from './doctor.schema';

export const FavoriteSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  createdAt: z.string(),
});

export type Favorite = z.infer<typeof FavoriteSchema>;

export const FavoriteWithDoctorSchema = FavoriteSchema.extend({
  doctor: DoctorSchema,
});

export type FavoriteWithDoctor = z.infer<typeof FavoriteWithDoctorSchema>;

export const ToggleFavoriteSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
});

export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteSchema>;
