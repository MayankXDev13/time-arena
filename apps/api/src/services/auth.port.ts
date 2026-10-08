import type { Session, User } from "better-auth";

export interface SessionPayload {
  user: Pick<User, "id" | "email" | "name" | "image">;
  session: Pick<Session, "id" | "expiresAt" | "userId">;
}

export interface AuthPort {
  getSession(headers: Headers): Promise<SessionPayload | null>;
}
