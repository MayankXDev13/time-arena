import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    userId: v.string(),
    categoryId: v.optional(v.id("categories")),
    start: v.number(), 
    endedAt: v.optional(v.number()), 
    duration: v.number(), 
    mode: v.union(v.literal("work"), v.literal("break")),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "categoryId"]),

  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(), 
  })
    .index("by_user", ["userId"]),

  userSettings: defineTable({
    userId: v.string(),
    streakThresholdMinutes: v.number(),
    autoStartBreaks: v.optional(v.boolean()),
    soundEnabled: v.optional(v.boolean()),
    defaultTimerMinutes: v.optional(v.number()),
    breakDurationMinutes: v.optional(v.number()),
    theme: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  streaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastQualifiedDate: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  profiles: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),
});