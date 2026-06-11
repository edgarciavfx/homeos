import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1),
  AUTH_SECRET: z.string().min(16),
  AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default("homeos@example.com"),
  NODE_ENV: z.enum(["development", "test", "production"]).optional().default("development"),
  RAILWAY_STATIC_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[env] Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
