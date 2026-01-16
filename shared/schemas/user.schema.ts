import { z } from 'zod';

export const UserRoleSchema = z.enum(['patient', 'doctor']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter'),
  role: UserRoleSchema,
  doctorId: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const UserResponseSchema = UserSchema.omit({ password: true });
export type UserResponse = z.infer<typeof UserResponseSchema>;
