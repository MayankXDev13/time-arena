import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { db, user } from "@repo/db";
import { createApp } from "./app.js";

const app = createApp();

const stamp = Date.now();
const emailA = `issue003a-${stamp}@example.com`;
const emailB = `issue003b-${stamp}@example.com`;
const password = "issue003-test-password";

async function signupAgent(email: string) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/sign-up/email").send({
    name: "Issue 003",
    email,
    password,
  });
  expect(res.status).toBe(200);
  return agent;
}

afterAll(async () => {
  await db.delete(user).where(eq(user.email, emailA));
  await db.delete(user).where(eq(user.email, emailB));
});

describe("session history + CRUD boundary (issue 003)", () => {
  it("rejects unauthenticated session writes and reads", async () => {
    await request(app).get("/api/sessions?limit=5").expect(401);
    await request(app).post("/api/sessions").send({}).expect(401);
    await request(app)
      .patch("/api/sessions/00000000-0000-0000-0000-000000000000")
      .send({})
      .expect(401);
    await request(app)
      .delete("/api/sessions/00000000-0000-0000-0000-000000000000")
      .expect(401);
    await request(app).get("/api/sessions/recent?limit=5").expect(401);
  });

  it("creates sessions then paginates history with a cursor", async () => {
    const agent = await signupAgent(emailA);
    const base = Date.now();

    const ids: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const res = await agent.post("/api/sessions").send({
        categoryId: null,
        start: base - i * 1000,
        duration: 600 + i,
        mode: i === 2 ? "break" : "work",
      });
      expect(res.status).toBe(201);
      expect(typeof res.body.id).toBe("string");
      ids.push(res.body.id as string);
    }

    const page1 = await agent.get("/api/sessions?limit=2").expect(200);
    expect(page1.body.page).toHaveLength(2);
    expect(page1.body.hasMore).toBe(true);
    expect(page1.body.totalCount).toBe(3);
    expect(typeof page1.body.nextCursor).toBe("string");

    const page2 = await agent
      .get(`/api/sessions?limit=2&cursor=${page1.body.nextCursor}`)
      .expect(200);
    expect(page2.body.page).toHaveLength(1);
    expect(page2.body.hasMore).toBe(false);

    const workOnly = await agent
      .get("/api/sessions?limit=10&mode=work")
      .expect(200);
    expect(workOnly.body.totalCount).toBe(2);
    expect(
      (workOnly.body.page as { mode: string }[]).every((s) => s.mode === "work"),
    ).toBe(true);
  });

  it("updates, ends, and deletes with owner scoping", async () => {
    const agent = await signupAgent(emailB);
    const other = await signupAgent(
      `issue003c-${stamp}@example.com`,
    );
    try {
      const created = await agent.post("/api/sessions").send({
        categoryId: null,
        start: Date.now(),
        duration: 900,
        mode: "work",
      });
      expect(created.status).toBe(201);
      const id = created.body.id as string;

      // Another owner cannot touch it.
      await other.patch(`/api/sessions/${id}`).send({ duration: 100 }).expect(404);
      await other.delete(`/api/sessions/${id}`).expect(404);

      // Owner updates then ends it.
      await agent.patch(`/api/sessions/${id}`).send({ duration: 1200 }).expect(200);
      await agent
        .patch(`/api/sessions/${id}`)
        .send({ endedAt: Date.now(), duration: 1500 })
        .expect(200);

      const history = await agent.get("/api/sessions?limit=10").expect(200);
      const row = (history.body.page as { id: string; duration: number }[]).find(
        (s) => s.id === id,
      );
      expect(row?.duration).toBe(1500);

      await agent.delete(`/api/sessions/${id}`).expect(200);
      const after = await agent.get("/api/sessions?limit=10").expect(200);
      expect(
        (after.body.page as { id: string }[]).some((s) => s.id === id),
      ).toBe(false);
    } finally {
      await db.delete(user).where(eq(user.email, `issue003c-${stamp}@example.com`));
    }
  });

  it("returns limit-scoped recent sessions", async () => {
    const agent = await signupAgent(`issue003d-${stamp}@example.com`);
    try {
      const base = Date.now();
      for (let i = 0; i < 3; i += 1) {
        await agent.post("/api/sessions").send({
          categoryId: null,
          start: base - i * 1000,
          duration: 300,
          mode: "work",
        });
      }
      const recent = await agent.get("/api/sessions/recent?limit=2").expect(200);
      expect(recent.body).toHaveLength(2);
    } finally {
      await db
        .delete(user)
        .where(eq(user.email, `issue003d-${stamp}@example.com`));
    }
  });
});
