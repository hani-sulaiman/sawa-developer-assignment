import { z } from 'zod';

export const FileTypeSchema = z.enum(['pdf', 'image', 'document', 'lab_result', 'scan', 'other']);
export type FileType = z.infer<typeof FileTypeSchema>;

export const MedicalRecordSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  title: z.string(),
  fileType: FileTypeSchema,
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
  notes: z.string().nullable(),
  uploadedAt: z.string(),
});

export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;

export const CreateMedicalRecordSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  fileType: FileTypeSchema,
  notes: z.string().max(1000).optional(),
});

export type CreateMedicalRecordInput = z.infer<typeof CreateMedicalRecordSchema>;
