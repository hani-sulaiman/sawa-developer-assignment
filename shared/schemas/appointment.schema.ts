import { z } from 'zod';

export const AppointmentStatusSchema = z.enum(['pending', 'confirmed', 'rejected']);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const CreateAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  patientEmail: z.string().email('Invalid email address'),
  patientPhone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s-]+$/, 'Invalid phone number format'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  reason: z.string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(500, 'Reason must be less than 500 characters'),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const AppointmentSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  patientId: z.string().optional(),
  patientName: z.string(),
  patientEmail: z.string().email(),
  patientPhone: z.string(),
  date: z.string(),
  time: z.string(),
  reason: z.string(),
  status: AppointmentStatusSchema,
  createdAt: z.string(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export const UpdateAppointmentStatusSchema = z.object({
  status: AppointmentStatusSchema,
});

export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>;
