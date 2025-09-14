import { z } from 'zod';

export type User = {
  id: string;
  username: string;
  password: string;
  macAddress: string | null;
  uploadLimitBites: number;
  downloadLimitBites: number;
  timeout: number; // in seconds
};

export const addUserFormSchema = z.object({
  username: z.string().min(6, {
    message: 'Username must be at least 6 characters.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  macAddress: z
    .string()
    .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
      message: 'Invalid MAC address format.',
    })
    .optional()
    .or(z.literal('')),
  uploadLimitBites: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, { message: 'Must be a positive number' }),
  downloadLimitBites: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, { message: 'Must be a positive number' }),
});

export type AddUserFormValues = z.infer<typeof addUserFormSchema>;
