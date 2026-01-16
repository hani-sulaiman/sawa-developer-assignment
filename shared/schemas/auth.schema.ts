import { z } from 'zod';
import { UserRoleSchema } from './user.schema';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter'),
  confirmPassword: z.string(),
  role: UserRoleSchema.default('patient'),
  doctorId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Alias for backwards compatibility
export const registerSchema = RegisterSchema;

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Alias for backwards compatibility
export const loginSchema = LoginSchema;

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: UserRoleSchema,
      doctorId: z.string().nullable().optional(),
    }),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
