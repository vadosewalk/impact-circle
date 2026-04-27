import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import * as schema from "./schema.js";

// Export schema directly
export * from "./schema.js";

/**
 * Factory to create a database instance based on environment.
 * In Cloudflare Workers, we prefer Neon serverless or equivalent via WebSocket/HTTP.
 */
export function createDb(url: string) {
  // If it's a neon URL or we are in a worker environment that doesn't support TCP
  if (url.includes("neon.tech")) {
    const sql = neon(url);
    return drizzleNeon(sql, { schema });
  }

  // Fallback to postgres-js for Node environments
  const queryClient = postgres(url, {
    prepare: false,
    max: 10,
    idle_timeout: 30,
  });
  return drizzlePostgres(queryClient, { schema });
}

// Default instance for Node environments (compat)
const defaultUrl = typeof process !== "undefined" ? process.env?.DATABASE_URL : undefined;
export const db = defaultUrl ? createDb(defaultUrl) : (null as any);
