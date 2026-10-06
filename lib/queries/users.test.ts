import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { profiles, userSettings } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import {
  getProfile,
  getSettings,
  updateProfile,
  updateSettings,
} from "./users";

const userId = `test-users-${randomUUID()}`;

afterAll(async () => {
  await db.delete(userSettings).where(eq(userSettings.userId, userId));
  await db.delete(profiles).where(eq(profiles.userId, userId));
});

describe("users queries (Convex parity)", () => {
  it("returns default settings for a new user and persists updates", async () => {
    const defaults = await getSettings(userId);
    expect(defaults.streakThresholdMinutes).toBe(15);
    expect(defaults.defaultTimerMinutes).toBe(25);

    await updateSettings(userId, {
      defaultTimerMinutes: 50,
      theme: "dark",
    });
    const updated = await getSettings(userId);
    expect(updated.defaultTimerMinutes).toBe(50);
    expect(updated.theme).toBe("dark");
    expect(updated.streakThresholdMinutes).toBe(15);
  });

  it("returns empty profile and persists bio", async () => {
    const { profile } = await getProfile(userId);
    expect(profile).toBeNull();

    await updateProfile(userId, { bio: "hello" });
    const after = await getProfile(userId);
    expect(after.profile?.bio).toBe("hello");
  });
});
