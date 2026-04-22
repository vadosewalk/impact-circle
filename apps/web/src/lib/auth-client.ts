import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  // Use relative path to leverage Next.js rewrites and avoid CORS
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, useSession, signOut } = authClient;
