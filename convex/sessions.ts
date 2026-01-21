import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getRecent = query({
  args: { userId: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);
  },
});

export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let todayMinutes = 0;
    let weeklyMinutes = 0;
    let currentStreak = 0;

    const workSessions = sessions.filter((s) => s.mode === "work");

    workSessions.forEach((session) => {
      const sessionTime = session.start;

      if (sessionTime >= today) {
        todayMinutes += Math.floor(session.duration / 60);
      }

      if (sessionTime >= weekAgo) {
        weeklyMinutes += Math.floor(session.duration / 60);
      }
    });

    const uniqueDays = new Set(
      workSessions.map((s) => new Date(s.start).toDateString())
    );

    const sortedDays = Array.from(uniqueDays).sort().reverse();

    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (sortedDays[i] === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      todayMinutes,
      weeklyMinutes,
      currentStreak,
    };
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    categoryId: v.optional(v.id("categories")),
    start: v.number(),
    duration: v.number(),
    mode: v.union(v.literal("work"), v.literal("break")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      categoryId: args.categoryId,
      start: args.start,
      duration: args.duration,
      mode: args.mode,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("sessions"),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      categoryId: args.categoryId,
    });
  },
});

export const endSession = mutation({
  args: {
    id: v.id("sessions"),
    endedAt: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      endedAt: args.endedAt,
      duration: args.duration,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) return; 

    await ctx.db.delete(args.id);
  },
});
