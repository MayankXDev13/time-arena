import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { db, user } from "@repo/db";
import { createApp } from "./app.js";

const app = createApp();
const stamp = Date.now();

const createdEmails: string[] = [];

function uniqueEmail(prefix: string): string {
  const email = `${prefix}-${stamp}-${Math.random().toString(36).slice(2)}@example.com`;
  createdEmails.push(email);
  return email;
}

async function signupAgent(email: string) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/sign-up/email").send({
    name: "Issue 006",
    email,
    password: "issue006-test-password",
  });
  expect(res.status).toBe(200);
  return agent;
}

afterAll(async () => {
  for (const email of createdEmails) {
    await db.delete(user).where(eq(user.email, email));
  }
});

describe("settings + profile boundary (issue 006)", () => {
  it("rejects unauthenticated settings and profile access", async () => {
    await request(app).get("/api/settings").expect(401);
    await request(app).patch("/api/settings").send({}).expect(401);
    await request(app).get("/api/profile").expect(401);
    await request(app).patch("/api/profile").send({}).expect(401);
  });

  it("returns defaults then round-trips partial settings updates", async () => {
    const agent = await signupAgent(uniqueEmail("issue006"));

    const fresh = await agent.get("/api/settings").expect(200);
    expect(fresh.body).toMatchObject({
      streakThresholdMinutes: 15,
      autoStartBreaks: true,
      soundEnabled: true,
      defaultTimerMinutes: 25,
      breakDurationMinutes: 5,
      theme: "system",
    });

    await agent
      .patch("/api/settings")
      .send({ defaultTimerMinutes: 50, theme: "dark", soundEnabled: false })
      .expect(200);

    const updated = await agent.get("/api/settings").expect(200);
    expect(updated.body).toMatchObject({
      defaultTimerMinutes: 50,
      theme: "dark",
      soundEnabled: false,
      streakThresholdMinutes: 15,
    });
  });

  it("round-trips profile bio without leaking across users", async () => {
    const agent = await signupAgent(uniqueEmail("issue006"));
    const other = await signupAgent(uniqueEmail("issue006"));

    const fresh = await agent.get("/api/profile").expect(200);
    expect(fresh.body.profile).toBeNull();
    expect(fresh.body.settings.streakThresholdMinutes).toBe(15);

    await agent.patch("/api/profile").send({ bio: "Chasing focus" }).expect(200);

    const updated = await agent.get("/api/profile").expect(200);
    expect(updated.body.profile.bio).toBe("Chasing focus");

    const otherProfile = await other.get("/api/profile").expect(200);
    expect(otherProfile.body.profile).toBeNull();
  });

  it("validates settings and profile bodies", async () => {
    const agent = await signupAgent(uniqueEmail("issue006"));
    await agent
      .patch("/api/settings")
      .send({ defaultTimerMinutes: "fifty" })
      .expect(400);
    await agent.patch("/api/settings").send({ theme: 42 }).expect(400);
    await agent.patch("/api/profile").send({ bio: 42 }).expect(400);
  });
});
