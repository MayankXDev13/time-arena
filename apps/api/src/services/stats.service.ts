import { and, eq, gte, lte } from "drizzle-orm";
import { db, sessions } from "@repo/db";

// Deep module: callers get aggregates through this narrow interface without
// caring whether the math happens in SQL or in memory (ports legacy logic verbatim).

export interface CategoryStat {
  categoryId: string;
  thisWeek: number;
  prevWeek: number;
  sessionCount: number;
  trendPercent: number;
}

export interface StatsResult {
  todayMinutes: number;
  weeklyMinutes: number;
  currentStreak: number;
  totalSessions: number;
  totalMinutes: number;
  longestSession: number;
  workMinutes: number;
  breakMinutes: number;
  dailyMinutes: { date: string; minutes: number }[];
  categoryMinutes: { [key: string]: number };
  categoryStats: CategoryStat[];
  totalCategoryMinutes: number;
}

export async function getStats(userId: string): Promise<StatsResult> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId));

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

  const workSessions = rows.filter((s) => s.mode === "work");

  const last7Days: { [key: string]: number } = {};
  const categoryMinutesThisWeek: { [key: string]: number } = {};
  const categoryMinutesPrevWeek: { [key: string]: number } = {};
  const categorySessionCount: { [key: string]: number } = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days[date.toDateString()] = 0;
  }

  rows.forEach((session) => {
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
          categoryMinutesThisWeek[session.categoryId] =
            (categoryMinutesThisWeek[session.categoryId] || 0) + durationMinutes;
          categorySessionCount[session.categoryId] =
            (categorySessionCount[session.categoryId] || 0) + 1;
        } else if (sessionTime >= twoWeeksAgo) {
          categoryMinutesPrevWeek[session.categoryId] =
            (categoryMinutesPrevWeek[session.categoryId] || 0) + durationMinutes;
        }
      }
    } else {
      breakMinutes += durationMinutes;
    }
  });

  const uniqueDays = new Set(
    workSessions.map((s) => new Date(s.start).toDateString()),
  );

  // Chronological, newest first (legacy sorted date strings lexicographically,
  // which breaks the streak whenever alphabetical order != recency).
  const sortedDays = Array.from(uniqueDays)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .reverse();

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
  Object.keys(categoryMinutesThisWeek).forEach((catId) => {
    categoryMinutes[catId] = categoryMinutesThisWeek[catId] || 0;
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

  const totalCategoryMinutes = Object.values(categoryMinutesThisWeek).reduce(
    (a, b) => a + b,
    0,
  );

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
}

export interface ContributionDay {
  date: string;
  minutes: number;
  sessions: number;
}

export async function getContributionGraph(
  userId: string,
  year?: number,
): Promise<ContributionDay[]> {
  const resolvedYear = year || new Date().getFullYear();
  const startOfYear = new Date(resolvedYear, 0, 1).getTime();
  const endOfYear = new Date(resolvedYear, 11, 31, 23, 59, 59, 999).getTime();

  const rows = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.start, startOfYear),
        lte(sessions.start, endOfYear),
      ),
    );

  const dailyData: { [key: string]: { minutes: number; sessions: number } } =
    {};

  const startDate = new Date(resolvedYear, 0, 1);
  const endDate = new Date(resolvedYear, 11, 31);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dailyData[dateStr] = { minutes: 0, sessions: 0 };
  }

  rows.forEach((session) => {
    if (session.mode === "work") {
      const dateStr = new Date(session.start).toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].sessions += 1;
        dailyData[dateStr].minutes += Math.floor(session.duration / 60);
      }
    }
  });

  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      minutes: data.minutes,
      sessions: data.sessions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
