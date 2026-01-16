import { z } from 'zod';

export const SpecialtySchema = z.enum([
  'general',
  'cardiology',
  'dermatology',
  'pediatrics',
  'orthopedics'
]);

export type Specialty = z.infer<typeof SpecialtySchema>;

export const DoctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: SpecialtySchema,
  hospital: z.string(),
  location: z.string(),
  phone: z.string().nullable().optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  experience: z.number().int().positive(),
  fee: z.number().positive(),
  currency: z.string().default('USD'),
  availableDays: z.array(z.string()),
  bio: z.string(),
  image: z.string(),
});

export type Doctor = z.infer<typeof DoctorSchema>;

export const UpdateDoctorProfileSchema = z.object({
  name: z.string().min(2).optional(),
  specialty: SpecialtySchema.optional(),
  hospital: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  experience: z.number().int().positive().optional(),
  fee: z.number().positive().optional(),
  currency: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  bio: z.string().min(10).optional(),
  image: z.string().optional(),
});

export type UpdateDoctorProfileInput = z.infer<typeof UpdateDoctorProfileSchema>;

export const DoctorFilterSchema = z.object({
  specialty: SpecialtySchema.optional(),
});

export type DoctorFilter = z.infer<typeof DoctorFilterSchema>;

export const SpecialtyOptionSchema = z.object({
  id: SpecialtySchema,
  name: z.string(),
});

export type SpecialtyOption = z.infer<typeof SpecialtyOptionSchema>;

export const specialties: SpecialtyOption[] = [
  { id: 'general', name: 'General Practice' },
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'dermatology', name: 'Dermatology' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'orthopedics', name: 'Orthopedics' },
];
