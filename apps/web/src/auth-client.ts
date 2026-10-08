import { createAuthClient } from "better-auth/react";

// Points at the Express API (issue 002). Full sign-in/up screens land in issue 007.
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});
