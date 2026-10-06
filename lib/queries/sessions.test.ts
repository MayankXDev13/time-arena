import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { sessions } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import {
  createSession,
  deleteSession,
  endSession,
  getContributionGraph,
  getSessionHistory,
  getStats,
  updateSession,
} from "./sessions";

const userId = `test-sessions-${randomUUID()}`;
const statsUserId = `test-stats-${randomUUID()}`;

afterAll(async () => {
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, statsUserId));
});

describe("sessions queries (Convex parity)", () => {
  it("creates a session and lists it in history", async () => {
    const start = Date.now();
    const id = await createSession({
      userId,
      start,
      duration: 0,
      mode: "work",
    });
    expect(typeof id).toBe("string");

    const { page, totalCount, hasMore } = await getSessionHistory({
      userId,
      limit: 10,
    });
    expect(totalCount).toBe(1);
    expect(hasMore).toBe(false);
    expect(page[0].mode).toBe("work");
    expect(page[0].start).toBe(start);
  });

  it("updates and ends a session", async () => {
    const id = await createSession({
      userId,
      start: Date.now(),
      duration: 0,
      mode: "break",
    });

    await updateSession(id, { duration: 300, mode: "work" });
    let history = await getSessionHistory({ userId, limit: 10 });
    const updated = history.page.find((s) => s.id === id)!;
    expect(updated.duration).toBe(300);
    expect(updated.mode).toBe("work");

    const endedAt = Date.now();
    await endSession(id, { endedAt, duration: 1500 });
    history = await getSessionHistory({ userId, limit: 10 });
    expect(history.page.find((s) => s.id === id)!.endedAt).toBe(endedAt);

    await deleteSession(id);
  });

  it("deletes a session", async () => {
    const id = await createSession({
      userId,
      start: Date.now(),
      duration: 60,
      mode: "work",
    });

    await deleteSession(id);
    const history = await getSessionHistory({ userId, limit: 10 });
    expect(history.page.find((s) => s.id === id)).toBeUndefined();
  });

  it("computes stats and contribution graph", async () => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const base = dayStart.getTime() + 1000;
    await createSession({
      userId: statsUserId,
      start: base,
      duration: 25 * 60,
      mode: "work",
    });
    await createSession({
      userId: statsUserId,
      start: base + 2000,
      duration: 50 * 60,
      mode: "work",
    });
    await createSession({
      userId: statsUserId,
      start: base + 3000,
      duration: 300,
      mode: "break",
    });

    const stats = await getStats(statsUserId);
    expect(stats.todayMinutes).toBe(75);
    expect(stats.totalSessions).toBe(2);
    expect(stats.workMinutes).toBe(75);
    expect(stats.breakMinutes).toBe(5);
    expect(stats.currentStreak).toBe(1);

    const graph = await getContributionGraph(
      statsUserId,
      new Date().getFullYear(),
    );
    // graph buckets by UTC date (same as Convex) - derive key from seed
    const seedKey = new Date(base).toISOString().split("T")[0];
    const seedDay = graph.find((g) => g.date === seedKey)!;
    expect(seedDay.minutes).toBe(75);
    expect(seedDay.sessions).toBe(2);
  });
});
