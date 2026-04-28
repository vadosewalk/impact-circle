import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@impact/db";
import type { getAuth } from "./auth";

export type AuthType = ReturnType<typeof getAuth>;

export type Variables = {
  db: NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;
  auth: AuthType;
  user: AuthType["$Infer"]["Session"]["user"] | undefined;
  session: AuthType["$Infer"]["Session"]["session"] | undefined;
};

export type Env = {
  Variables: Variables;
  Bindings: {
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    FRONTEND_URL: string;
    BETTER_AUTH_URL: string;
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
  };
};
