import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      return {
        streakThresholdMinutes: 15,
        autoStartBreaks: true,
        soundEnabled: true,
        defaultTimerMinutes: 25,
        breakDurationMinutes: 5,
        theme: "system",
      };
    }

    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    userId: v.string(),
    streakThresholdMinutes: v.optional(v.number()),
    autoStartBreaks: v.optional(v.boolean()),
    soundEnabled: v.optional(v.boolean()),
    defaultTimerMinutes: v.optional(v.number()),
    breakDurationMinutes: v.optional(v.number()),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        streakThresholdMinutes: updates.streakThresholdMinutes ?? 15,
        autoStartBreaks: updates.autoStartBreaks ?? true,
        soundEnabled: updates.soundEnabled ?? true,
        defaultTimerMinutes: updates.defaultTimerMinutes ?? 25,
        breakDurationMinutes: updates.breakDurationMinutes ?? 5,
        theme: updates.theme ?? "system",
      });
    }

    return { success: true };
  },
});

export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      profile: profile || null,
      settings: settings || {
        streakThresholdMinutes: 15,
        autoStartBreaks: true,
        soundEnabled: true,
        defaultTimerMinutes: 25,
        breakDurationMinutes: 5,
        theme: "system",
      },
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("profiles", {
        userId,
        ...updates,
      });
    }

    return { success: true };
  },
});

export const updateAvatar = mutation({
  args: {
    userId: v.string(),
    avatarStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { avatarStorageId: args.avatarStorageId });
    } else {
      await ctx.db.insert("profiles", {
        userId: args.userId,
        avatarStorageId: args.avatarStorageId,
      });
    }

    return { success: true };
  },
});

export const getAvatarUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

export const getUploadUrl = mutation({
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});
