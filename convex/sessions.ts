import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getRecent = query({
  args: {
    userId: v.string(),
    limit: v.number(),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    let sessions = await baseQuery.take(args.limit);

    if (args.categoryId) {
      sessions = sessions.filter((s) => s.categoryId === args.categoryId);
    }

    return sessions;
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
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    let todayMinutes = 0;
    let weeklyMinutes = 0;
    let currentStreak = 0;
    let totalSessions = 0;
    let totalMinutes = 0;
    let longestSession = 0;
    let workMinutes = 0;
    let breakMinutes = 0;

    const workSessions = sessions.filter((s) => s.mode === "work");

    const last7Days: { [key: string]: number } = {};
    const categoryMinutesThisWeek: { [key: string]: number } = {};
    const categoryMinutesPrevWeek: { [key: string]: number } = {};
    const categorySessionCount: { [key: string]: number } = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days[date.toDateString()] = 0;
    }

    sessions.forEach((session) => {
      const sessionTime = session.start;
      const durationMinutes = Math.floor(session.duration / 60);
      const sessionDate = new Date(sessionTime).toDateString();

      if (session.mode === "work") {
        if (sessionTime >= today) {
          todayMinutes += durationMinutes;
        }

        if (sessionTime >= weekAgo) {
          weeklyMinutes += durationMinutes;
        }

        if (last7Days[sessionDate] !== undefined) {
          last7Days[sessionDate] += durationMinutes;
        }

        totalSessions++;
        totalMinutes += durationMinutes;
        workMinutes += durationMinutes;
        longestSession = Math.max(longestSession, durationMinutes);

        if (session.categoryId) {
          if (sessionTime >= weekAgo) {
            categoryMinutesThisWeek[session.categoryId] = (categoryMinutesThisWeek[session.categoryId] || 0) + durationMinutes;
            categorySessionCount[session.categoryId] = (categorySessionCount[session.categoryId] || 0) + 1;
          } else if (sessionTime >= twoWeeksAgo) {
            categoryMinutesPrevWeek[session.categoryId] = (categoryMinutesPrevWeek[session.categoryId] || 0) + durationMinutes;
          }
        }
      } else {
        breakMinutes += durationMinutes;
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

    const dailyMinutes = Object.entries(last7Days)
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const categoryMinutes: { [key: string]: number } = {};
    Object.keys(categoryMinutesThisWeek).forEach(catId => {
      categoryMinutes[catId] = (categoryMinutesThisWeek[catId] || 0);
    });

    const allCategoryIds = new Set([
      ...Object.keys(categoryMinutesThisWeek),
      ...Object.keys(categoryMinutesPrevWeek),
    ]);

    const categoryStats = Array.from(allCategoryIds).map((categoryId) => {
      const thisWeek = categoryMinutesThisWeek[categoryId] || 0;
      const prevWeek = categoryMinutesPrevWeek[categoryId] || 0;
      const sessionCount = categorySessionCount[categoryId] || 0;

      let trendPercent = 0;
      if (prevWeek === 0 && thisWeek > 0) {
        trendPercent = 100;
      } else if (prevWeek > 0) {
        trendPercent = Math.round(((thisWeek - prevWeek) / prevWeek) * 100);
      }

      return {
        categoryId,
        thisWeek,
        prevWeek,
        sessionCount,
        trendPercent,
      };
    });

    const totalCategoryMinutes = Object.values(categoryMinutesThisWeek).reduce((a, b) => a + b, 0);

    return {
      todayMinutes,
      weeklyMinutes,
      currentStreak,
      totalSessions,
      totalMinutes,
      longestSession,
      workMinutes,
      breakMinutes,
      dailyMinutes,
      categoryMinutes,
      categoryStats,
      totalCategoryMinutes,
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
