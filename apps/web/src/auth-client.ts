import { createAuthClient } from "better-auth/react";

// Points at the Express API (issue 002). Full sign-in/up screens land in issue 007.
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});
