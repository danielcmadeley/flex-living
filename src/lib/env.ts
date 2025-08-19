import { z } from "zod";

// Simple environment schema
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  DATABASE_URL: z.string(),
  HOSTAWAY_CLIENT_ID: z.string().optional(),
  HOSTAWAY_CLIENT_SECRET: z.string().optional(),
  HOSTAWAY_BASE_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Simple validation - only validate in production
function validateEnv() {
  // Skip validation in development if vars are missing
  if (process.env.NODE_ENV === "development") {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      DATABASE_URL: process.env.DATABASE_URL || "",
      HOSTAWAY_CLIENT_ID: process.env.HOSTAWAY_CLIENT_ID,
      HOSTAWAY_CLIENT_SECRET: process.env.HOSTAWAY_CLIENT_SECRET,
      HOSTAWAY_BASE_URL: process.env.HOSTAWAY_BASE_URL,
      NODE_ENV: "development" as const,
    };
  }

  return envSchema.parse(process.env);
}

// Export environment variables
export const env = validateEnv();

// Type for environment variables
export type Env = z.infer<typeof envSchema>;
