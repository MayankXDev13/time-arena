export const XP_PER_LEVEL = 600;

export function calculateLevel(totalMinutes: number) {
  const level = Math.floor(totalMinutes / XP_PER_LEVEL) + 1;
  const xp = totalMinutes % XP_PER_LEVEL;
  return { level, xp, xpForNextLevel: XP_PER_LEVEL };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: BadgeCheckStats) => boolean;
}

export interface BadgeCheckStats {
  totalMinutes: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  sessionsByHour: { [hour: number]: number };
  firstSessionDate?: Date;
}

export const BADGES: Badge[] = [
  {
    id: "first",
    name: "First Step",
    description: "Complete your first session",
    icon: "🎯",
    check: (stats) => stats.totalSessions >= 1,
  },
  {
    id: "streak7",
    name: "Week Warrior",
    description: "7 day streak",
    icon: "🔥",
    check: (stats) => stats.currentStreak >= 7,
  },
  {
    id: "streak30",
    name: "Monthly Master",
    description: "30 day streak",
    icon: "⚡",
    check: (stats) => stats.currentStreak >= 30,
  },
  {
    id: "sessions10",
    name: "Dedicated",
    description: "10 sessions",
    icon: "💪",
    check: (stats) => stats.totalSessions >= 10,
  },
  {
    id: "sessions100",
    name: "Focus Pro",
    description: "100 sessions",
    icon: "🏆",
    check: (stats) => stats.totalSessions >= 100,
  },
  {
    id: "hours10",
    name: "Getting Started",
    description: "10 hours total",
    icon: "🌟",
    check: (stats) => stats.totalMinutes >= 600,
  },
  {
    id: "hours100",
    name: "Century Club",
    description: "100 hours total",
    icon: "💎",
    check: (stats) => stats.totalMinutes >= 6000,
  },
  {
    id: "hours500",
    name: "Timekeeper",
    description: "500 hours total",
    icon: "👑",
    check: (stats) => stats.totalMinutes >= 30000,
  },
  {
    id: "early",
    name: "Early Bird",
    description: "Session before 6am",
    icon: "🌅",
    check: (stats) => (stats.sessionsByHour[0] || 0) + (stats.sessionsByHour[1] || 0) + (stats.sessionsByHour[2] || 0) + (stats.sessionsByHour[3] || 0) + (stats.sessionsByHour[4] || 0) + (stats.sessionsByHour[5] || 0) >= 1,
  },
  {
    id: "night",
    name: "Night Owl",
    description: "Session after 10pm",
    icon: "🦉",
    check: (stats) => (stats.sessionsByHour[22] || 0) + (stats.sessionsByHour[23] || 0) >= 1,
  },
  {
    id: "streak100",
    name: "Century Streak",
    description: "100 day streak",
    icon: "🎉",
    check: (stats) => stats.longestStreak >= 100,
  },
];

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function formatTotalTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} minutes`;
  }
  if (mins === 0) {
    return `${hours} hours`;
  }
  return `${hours}h ${mins}m`;
}
