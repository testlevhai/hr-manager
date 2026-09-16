import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  GOOGLE_CLIENT_ID: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ALLOW_DEV_LOGIN: z.stringbool().default(false),
});

export const env = envSchema.parse(process.env);
