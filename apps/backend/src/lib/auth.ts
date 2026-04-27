import * as schema from "@impact/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { sendEmail } from "./email";

/**
 * Better Auth initialization factory.
 * In a serverless/worker environment, we inject the database instance and environment variables.
 */
export function getAuth(db: any, env?: {
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  FRONTEND_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}) {
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
    // baseURL should be the public-facing URL of the auth server.
    // When using Next.js rewrites, this is the frontend URL.
    baseURL: BETTER_AUTH_URL || FRONTEND_URL,
    secret: BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID || "",
        clientSecret: GOOGLE_CLIENT_SECRET || "",
      },
    },
    trustedOrigins: [
      FRONTEND_URL,
      "https://impact-circle-web.netlify.app"
    ],
    advanced: {
      useRuntimeConfig: true,
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        sendInvitationEmail: async (data) => {
          const { email, organization, inviter, invitation } = data;
          await sendEmail({
            to: email,
            subject: `Join ${organization.name} on Impact Circle`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h1 style="color: #7c3aed; margin-bottom: 24px;">Impact Circle</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #1e1b4b;">
                  <strong>${inviter.user.name}</strong> has invited you to join <strong>${organization.name}</strong> as an <strong>${invitation.role}</strong>.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #1e1b4b; margin-bottom: 32px;">
                  Impact Circle is a transparent marketplace for social impact. Join your team to start coordinating community aid.
                </p>
                <a href="${FRONTEND_URL}/accept-invite?id=${invitation.id}" 
                   style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Accept Invitation
                </a>
                <p style="font-size: 12px; color: #64748b; margin-top: 32px;">
                  This invitation will expire in 48 hours. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            `,
          }, RESEND_API_KEY, EMAIL_FROM);
        },
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
