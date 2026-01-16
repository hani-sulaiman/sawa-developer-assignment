import { z } from 'zod';

export const BloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export type BloodType = z.infer<typeof BloodTypeSchema>;

export const GenderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
export type Gender = z.infer<typeof GenderSchema>;

export const PatientProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateOfBirth: z.string().nullable(),
  gender: GenderSchema.nullable(),
  bloodType: BloodTypeSchema.nullable(),
  allergies: z.string().nullable(),
  medicalHistory: z.string().nullable(),
  emergencyContact: z.string().nullable(),
  emergencyPhone: z.string().nullable(),
  insuranceProvider: z.string().nullable(),
  insuranceNumber: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  updatedAt: z.string(),
});

export type PatientProfile = z.infer<typeof PatientProfileSchema>;

export const UpdatePatientProfileSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: GenderSchema.optional(),
  bloodType: BloodTypeSchema.optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type UpdatePatientProfileInput = z.infer<typeof UpdatePatientProfileSchema>;
