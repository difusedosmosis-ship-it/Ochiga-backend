// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`⚠️ Environment variable ${name} is missing.`);
    return "";
  }
  return value;
}

export const PORT = parseInt(process.env.PORT || "5000", 10);

export function logPortBinding(port: number) {
  console.log(`Ochiga backend is listening on http://localhost:${port}`);
}

export const SUPABASE_URL = requireEnv("SUPABASE_URL");
export const SUPABASE_ANON_KEY = requireEnv("SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
export const APP_JWT_SECRET = requireEnv("APP_JWT_SECRET");
