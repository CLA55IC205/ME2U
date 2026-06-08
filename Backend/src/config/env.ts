import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:5500,http://localhost:5173'),
  AUTH_DEV_MODE: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .default('true'),
  AUTO_RELEASE_HOURS: z.coerce.number().default(24),
});

export type Env = z.infer<typeof envSchema>;

// Parse once at startup — any missing required vars will throw clearly.
const parsed = envSchema.safeParse(process.env);

export function assertEnv() {
  if (!parsed.success) {
    console.error('❌  Missing or invalid environment variables:\n');
    parsed.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\n  Make sure Backend/.env exists (run ./scripts/setup-db.sh)\n');
    process.exit(1);
  }
}

export const env: Env = parsed.success
  ? parsed.data
  : ({} as Env); // assertEnv() will exit before this is used

// Derived helpers
export const corsOrigins = () =>
  env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
