import { z } from 'zod';

export const MedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

export type Medication = z.infer<typeof MedicationSchema>;

export const CreatePrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  medications: z.array(MedicationSchema).min(1, 'At least one medication is required'),
  diagnosis: z.string().optional(),
  instructions: z.string().optional(),
  validUntil: z.string().optional(),
});

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;

export const PrescriptionSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  appointmentId: z.string().nullable(),
  medications: z.array(MedicationSchema),
  diagnosis: z.string().nullable(),
  instructions: z.string().nullable(),
  validUntil: z.string().nullable(),
  createdAt: z.string(),
});

export type Prescription = z.infer<typeof PrescriptionSchema>;
