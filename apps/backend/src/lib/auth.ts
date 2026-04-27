import * as schema from "@impact/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(schema.db, {
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
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
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
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/accept-invite?id=${invitation.id}" 
                 style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Accept Invitation
              </a>
              <p style="font-size: 12px; color: #64748b; margin-top: 32px;">
                This invitation will expire in 48 hours. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          `,
        });
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
