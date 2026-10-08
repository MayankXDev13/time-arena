import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fromNodeHeaders } from "better-auth/node";
import type { IncomingHttpHeaders } from "node:http";
import { authSchema, db } from "@repo/db";
import type { AuthPort, SessionPayload } from "./services/auth.port.js";

function socialProviders() {
  const providers: Record<string, unknown> = {};
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }
  return providers;
}

export const auth = betterAuth({
  baseURL: process.env.API_URL ?? "http://localhost:3000",
  trustedOrigins: ["http://localhost:5173", "http://localhost:3001"],
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  socialProviders: socialProviders(),
});

export const authPort: AuthPort = {
  async getSession(headers: Headers): Promise<SessionPayload | null> {
    const data = await auth.api.getSession({ headers });
    if (!data?.user || !data?.session) return null;
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        image: data.user.image ?? null,
      },
      session: {
        id: data.session.id,
        expiresAt: data.session.expiresAt,
        userId: data.session.userId,
      },
    };
  },
};

export function nodeHeaders(headers: IncomingHttpHeaders): Headers {
  return fromNodeHeaders(headers);
}
