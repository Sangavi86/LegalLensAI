import { z } from 'zod';

/**
 * Application configuration — validated at startup.
 * Any missing required env var will throw immediately with a clear error.
 */

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(8000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_PRIVATE_KEY: z
    .string()
    .min(1, 'JWT_PRIVATE_KEY is required')
    .transform((k) => k.replace(/\\n/g, '\n')),
  JWT_PUBLIC_KEY: z
    .string()
    .min(1, 'JWT_PUBLIC_KEY is required')
    .transform((k) => k.replace(/\\n/g, '\n')),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 chars'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  AI_SERVICE_URL: z.string().default('http://localhost:8001'),
  AI_SERVICE_SECRET: z.string().default('dev-secret'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }
  return result.data;
}

export const config = validateEnv();
export type AppConfig = typeof config;
