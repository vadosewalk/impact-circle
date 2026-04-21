import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  // Use relative path to leverage Next.js rewrites and avoid CORS
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});

export const { signIn, signUp, useSession, signOut } = authClient;
