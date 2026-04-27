import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const queryClient = postgres(process.env.DATABASE_URL, {
  prepare: false, // Required for Supabase Transaction Mode (port 6543)
  max: 10,
  idle_timeout: 30,
});
export const db = drizzle(queryClient, { schema });

export * from "./schema.js";
