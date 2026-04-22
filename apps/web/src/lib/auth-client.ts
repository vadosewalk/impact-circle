import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use relative path to leverage Next.js rewrites and avoid CORS
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      trustScore: {
        type: "number",
      },
    },
  },
}) as any;

export const { signIn, signUp, useSession, signOut, getSession } = authClient;
