import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const urlSchema = z.string().url('Please enter a valid URL').optional();

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .optional();

export const userSchema = z.object({
  id: z.string().optional(),
  email: emailSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  avatar: urlSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userUpdateSchema = userSchema.partial();

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters'),
  phone: phoneSchema,
});

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });

export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must be less than 200 characters'),
  filters: z.record(z.string(), z.unknown()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default.
  allowedTypes: z
    .array(z.string())
    .default(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
      sms: z.boolean().default(false),
    })
    .default({ email: true, push: false, sms: false }),
  privacy: z
    .object({
      profileVisibility: z
        .enum(['public', 'private', 'friends'])
        .default('public'),
      allowMessages: z.boolean().default(true),
    })
    .default({ profileVisibility: 'public', allowMessages: true }),
});

export type User = z.infer<typeof userSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Search = z.infer<typeof searchSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
