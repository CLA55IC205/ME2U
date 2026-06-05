import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5500')
    .split(',')
    .map((s) => s.trim()),
  authDevMode: process.env.AUTH_DEV_MODE === 'true',
  autoReleaseHours: parseInt(process.env.AUTO_RELEASE_HOURS ?? '24', 10),
};

export function assertEnv(): void {
  required('DATABASE_URL');
}
