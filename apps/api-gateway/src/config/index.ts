import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  AI_ENGINE_URL: z.string().url().default('http://localhost:8000'),
  AI_ENGINE_API_KEY: z.string().default('internal-service-token-dev-secret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables in API Gateway:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
