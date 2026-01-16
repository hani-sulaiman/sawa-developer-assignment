import { z } from 'zod';

export const PatientNoteSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  appointmentId: z.string().nullable(),
  note: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PatientNote = z.infer<typeof PatientNoteSchema>;

export const CreatePatientNoteSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  note: z.string().min(1, 'Note content is required').max(5000),
});

export type CreatePatientNoteInput = z.infer<typeof CreatePatientNoteSchema>;

export const UpdatePatientNoteSchema = z.object({
  note: z.string().min(1, 'Note content is required').max(5000),
});

export type UpdatePatientNoteInput = z.infer<typeof UpdatePatientNoteSchema>;
