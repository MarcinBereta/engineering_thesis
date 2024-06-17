import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});
