import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { db, user } from "@repo/db";
import { createApp } from "./app.js";

const app = createApp();
const stamp = Date.now();

// Every test execution mints fresh emails so vitest retries never collide
// with users/sessions seeded by a prior attempt. All are cleaned up after.
const createdEmails: string[] = [];

function uniqueEmail(prefix: string): string {
  const email = `${prefix}-${stamp}-${Math.random().toString(36).slice(2)}@example.com`;
  createdEmails.push(email);
  return email;
}

async function signupAgent(email: string) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/sign-up/email").send({
    name: "Issue 004",
    email,
    password: "issue004-test-password",
  });
  expect(res.status).toBe(200);
  return agent;
}

async function seedWork(
  agent: request.Agent,
  input: { start: number; duration: number; categoryId?: string | null },
) {
  const res = await agent.post("/api/sessions").send({
    categoryId: input.categoryId ?? null,
    start: input.start,
    duration: input.duration,
    mode: "work",
  });
  expect(res.status).toBe(201);
}

afterAll(async () => {
  for (const email of createdEmails) {
    await db.delete(user).where(eq(user.email, email));
  }
});

describe("stats + contributions boundary (issue 004)", () => {
  it("rejects unauthenticated stats and contributions", async () => {
    await request(app).get("/api/sessions/stats").expect(401);
    await request(app).get("/api/sessions/contributions").expect(401);
  });

  it("computes totals from seeded work/break fixtures", async () => {
    const agent = await signupAgent(uniqueEmail("issue004"));
    const now = Date.now();
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
    const cat = "11111111-1111-4111-8111-111111111111";

    await seedWork(agent, { start: now, duration: 3600, categoryId: cat });
    await seedWork(agent, { start: eightDaysAgo, duration: 3600, categoryId: cat });
    const brk = await agent.post("/api/sessions").send({
      categoryId: null,
      start: now,
      duration: 1800,
      mode: "break",
    });
    expect(brk.status).toBe(201);

    const res = await agent.get("/api/sessions/stats").expect(200);
    const stats = res.body as {
      todayMinutes: number;
      weeklyMinutes: number;
      totalSessions: number;
      totalMinutes: number;
      workMinutes: number;
      breakMinutes: number;
      currentStreak: number;
      dailyMinutes: { date: string; minutes: number }[];
      categoryMinutes: Record<string, number>;
      categoryStats: {
        categoryId: string;
        thisWeek: number;
        prevWeek: number;
        sessionCount: number;
        trendPercent: number;
      }[];
      totalCategoryMinutes: number;
    };

    expect(stats.todayMinutes).toBe(60);
    expect(stats.totalSessions).toBe(2);
    expect(stats.totalMinutes).toBe(120);
    expect(stats.workMinutes).toBe(120);
    expect(stats.breakMinutes).toBe(30);
    expect(stats.weeklyMinutes).toBe(60);
    expect(stats.currentStreak).toBeGreaterThanOrEqual(1);
    expect(stats.dailyMinutes).toHaveLength(7);
    expect(stats.categoryMinutes[cat]).toBe(60);
    const catStat = stats.categoryStats.find((c) => c.categoryId === cat);
    expect(catStat?.thisWeek).toBe(60);
    expect(catStat?.prevWeek).toBe(60);
    expect(catStat?.sessionCount).toBe(1);
    expect(catStat?.trendPercent).toBe(0);
    expect(stats.totalCategoryMinutes).toBe(60);
  });

  it("returns a full-year contribution series with seeded days", async () => {
    const email = uniqueEmail("issue004b");
    const agent = await signupAgent(email);
    try {
      const year = new Date().getFullYear();
      const dayStart = new Date(year, 5, 15, 12, 0, 0).getTime();
      await seedWork(agent, { start: dayStart, duration: 3600 });

      const res = await agent
        .get(`/api/sessions/contributions?year=${year}`)
        .expect(200);
      const days = res.body as { date: string; minutes: number; sessions: number }[];
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      expect(days).toHaveLength(isLeap ? 366 : 365);

      const entry = days.find((d) => d.date === `${year}-06-15`);
      expect(entry?.sessions).toBe(1);
      expect(entry?.minutes).toBe(60);
    } finally {
      await db.delete(user).where(eq(user.email, email));
    }
  });
});
