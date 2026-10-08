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
    name: "Issue 005",
    email,
    password: "issue005-test-password",
  });
  expect(res.status).toBe(200);
  return agent;
}

afterAll(async () => {
  for (const email of createdEmails) {
    await db.delete(user).where(eq(user.email, email));
  }
});

describe("categories + seed boundary (issue 005)", () => {
  it("rejects unauthenticated category access", async () => {
    await request(app).get("/api/categories").expect(401);
    await request(app).post("/api/categories").send({}).expect(401);
    await request(app).post("/api/categories/seed").send({}).expect(401);
    await request(app)
      .patch("/api/categories/00000000-0000-0000-0000-000000000000")
      .send({})
      .expect(401);
    await request(app)
      .delete("/api/categories/00000000-0000-0000-0000-000000000000")
      .expect(401);
  });

  it("seeds defaults idempotently on a fresh account", async () => {
    const agent = await signupAgent(uniqueEmail("issue005"));

    const first = await agent.post("/api/categories/seed").expect(200);
    expect(first.body.seeded).toBe(true);

    const list = await agent.get("/api/categories").expect(200);
    const names = (list.body as { name: string }[]).map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(["Other", "Work", "Study"]));

    const second = await agent.post("/api/categories/seed").expect(200);
    expect(second.body.seeded).toBe(false);

    const relist = await agent.get("/api/categories").expect(200);
    expect(relist.body).toHaveLength(list.body.length);
  });

  it("CRUDs categories with owner scoping", async () => {
    const agent = await signupAgent(uniqueEmail("issue005"));
    const other = await signupAgent(uniqueEmail("issue005"));

    const created = await agent
      .post("/api/categories")
      .send({ name: "Deep Work", color: "bg-violet-500" })
      .expect(201);
    const id = created.body.id as string;
    expect(typeof id).toBe("string");

    await other
      .patch(`/api/categories/${id}`)
      .send({ name: "Hijacked", color: "bg-red-500" })
      .expect(404);
    await other.delete(`/api/categories/${id}`).expect(404);

    await agent
      .patch(`/api/categories/${id}`)
      .send({ name: "Shallow Work", color: "bg-amber-500" })
      .expect(200);

    const list = await agent.get("/api/categories").expect(200);
    const row = (list.body as { id: string; name: string; color: string }[]).find(
      (c) => c.id === id,
    );
    expect(row?.name).toBe("Shallow Work");
    expect(row?.color).toBe("bg-amber-500");

    const otherList = await other.get("/api/categories").expect(200);
    expect(
      (otherList.body as { id: string }[]).some((c) => c.id === id),
    ).toBe(false);

    await agent.delete(`/api/categories/${id}`).expect(200);
    const after = await agent.get("/api/categories").expect(200);
    expect((after.body as { id: string }[]).some((c) => c.id === id)).toBe(false);
  });

  it("validates category bodies", async () => {
    const agent = await signupAgent(uniqueEmail("issue005"));
    await agent.post("/api/categories").send({ name: "NoColor" }).expect(400);
    await agent
      .post("/api/categories")
      .send({ name: "", color: "bg-blue-500" })
      .expect(400);
  });
});
