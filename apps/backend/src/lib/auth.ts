import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@impact/db";

export const auth = betterAuth({
  database: drizzleAdapter(schema.db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      trustScore: {
        type: "number",
        defaultValue: 0,
      },
      bio: {
        type: "string",
      },
    },
  },
});
