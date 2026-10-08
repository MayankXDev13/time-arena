import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { db, user } from "@repo/db";
import { createApp } from "./app.js";

const app = createApp();
const email = `issue002-${Date.now()}@example.com`;
const password = "issue002-test-password";

afterAll(async () => {
  // Best-effort cleanup: cascade removes sessions/accounts.
  await db.delete(user).where(eq(user.email, email));
});

describe("auth boundary (issue 002)", () => {
  it("rejects the protected probe without a session", async () => {
    const res = await request(app).get("/api/session");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "unauthenticated" });
  });

  it("signs up with email/password", async () => {
    const res = await request(app).post("/api/auth/sign-up/email").send({
      name: "Issue 002",
      email,
      password,
    });
    expect(res.status).toBe(200);
  });

  it("signs in and authorizes the protected probe", async () => {
    const agent = request.agent(app);
    const signIn = await agent.post("/api/auth/sign-in/email").send({
      email,
      password,
    });
    expect(signIn.status).toBe(200);

    const probe = await agent.get("/api/session");
    expect(probe.status).toBe(200);
    expect(probe.body.user.email).toBe(email);
    expect(typeof probe.body.session.id).toBe("string");
  });
});
