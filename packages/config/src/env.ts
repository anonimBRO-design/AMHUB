// Environment variable configuration
// Based on Product Specification §15 Infrastructure

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;

  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0 && env.NODE_ENV !== "test") {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return true;
}
