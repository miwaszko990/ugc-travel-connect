import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const registerSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  role: z.enum(['creator', 'brand'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
// review trigger
