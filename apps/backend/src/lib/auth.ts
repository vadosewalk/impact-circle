import * as schema from "@impact/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

/**
 * Better Auth initialization factory.
 * In a serverless/worker environment, we inject the database instance and environment variables.
 */
export function getAuth(
  db: any,
  env?: {
    BETTER_AUTH_URL?: string;
    BETTER_AUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    FRONTEND_URL?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
  },
) {
  const pEnv = typeof process !== "undefined" ? process.env : {};
  const BETTER_AUTH_URL = env?.BETTER_AUTH_URL || pEnv.BETTER_AUTH_URL;
  const BETTER_AUTH_SECRET = env?.BETTER_AUTH_SECRET || pEnv.BETTER_AUTH_SECRET;
  const GOOGLE_CLIENT_ID = env?.GOOGLE_CLIENT_ID || pEnv.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = env?.GOOGLE_CLIENT_SECRET || pEnv.GOOGLE_CLIENT_SECRET;
  const FRONTEND_URL = env?.FRONTEND_URL || pEnv.FRONTEND_URL || "http://localhost:3000";
  const RESEND_API_KEY = env?.RESEND_API_KEY || pEnv.RESEND_API_KEY;
  const EMAIL_FROM = env?.EMAIL_FROM || pEnv.EMAIL_FROM;

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        organization: schema.organization,
        member: schema.member,
        invitation: schema.invitation,
      },
    }),
    // CRITICAL FIX: BaseURL must always be the public-facing FRONTEND URL for redirects to work correctly.
    baseURL: FRONTEND_URL,
    secret: BETTER_AUTH_SECRET,

    // Simplified Email & Password setup
    emailAndPassword: {
      enabled: true,
      // NOTE: Email verification is off by default. No 'sendVerificationEmail' is configured.
      // Add a placeholder for password reset to avoid crashes if called.
      sendResetPassword: async ({ user, url }) => {
        console.log(`Password reset requested for ${user.email}.`);
        console.log(`In a real app, you would send an email with this URL: ${url}`);
        // In the future, you can add your email sending logic here.
        await Promise.resolve();
      },
    },

    // Google Provider
    socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID || "",
        clientSecret: GOOGLE_CLIENT_SECRET || "",
      },
    },

    // Whitelist frontend origins for CSRF protection
    trustedOrigins: [FRONTEND_URL, "https://impact-circle-web.netlify.app"],

    advanced: {},

    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        // REMOVED: sendInvitationEmail handler to decouple from Resend.
        // Invitations will be link-based until a new email provider is added.
      }),
    ],

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
}

// For compatibility with Node scripts/legacy code
import { db as defaultDb } from "@impact/db";
export const auth = defaultDb ? getAuth(defaultDb) : (null as any);
