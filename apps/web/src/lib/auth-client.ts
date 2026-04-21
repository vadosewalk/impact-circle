import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Backend URL
});

export const { signIn, signUp, useSession, signOut } = authClient;
