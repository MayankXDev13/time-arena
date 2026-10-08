import { eq } from "drizzle-orm";
import { db, profiles, userSettings } from "@repo/db";

export interface SettingsRow {
  userId: string;
  streakThresholdMinutes: number;
  autoStartBreaks: boolean | null;
  soundEnabled: boolean | null;
  defaultTimerMinutes: number | null;
  breakDurationMinutes: number | null;
  theme: string | null;
}

const DEFAULT_SETTINGS: Omit<SettingsRow, "userId"> = {
  streakThresholdMinutes: 15,
  autoStartBreaks: true,
  soundEnabled: true,
  defaultTimerMinutes: 25,
  breakDurationMinutes: 5,
  theme: "system",
};

export async function getSettings(userId: string): Promise<SettingsRow> {
  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  if (!row) return { userId, ...DEFAULT_SETTINGS };
  return {
    userId: row.userId,
    streakThresholdMinutes: row.streakThresholdMinutes,
    autoStartBreaks: row.autoStartBreaks,
    soundEnabled: row.soundEnabled,
    defaultTimerMinutes: row.defaultTimerMinutes,
    breakDurationMinutes: row.breakDurationMinutes,
    theme: row.theme,
  };
}

export async function updateSettings(
  userId: string,
  input: Partial<Omit<SettingsRow, "userId">>,
): Promise<void> {
  const [existing] = await db
    .select({ id: userSettings.id })
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  if (existing) {
    await db
      .update(userSettings)
      .set(input)
      .where(eq(userSettings.id, existing.id));
  } else {
    await db.insert(userSettings).values({
      userId,
      streakThresholdMinutes:
        input.streakThresholdMinutes ?? DEFAULT_SETTINGS.streakThresholdMinutes,
      autoStartBreaks: input.autoStartBreaks ?? true,
      soundEnabled: input.soundEnabled ?? true,
      defaultTimerMinutes: input.defaultTimerMinutes ?? 25,
      breakDurationMinutes: input.breakDurationMinutes ?? 5,
      theme: input.theme ?? "system",
    });
  }
}

export interface ProfileRow {
  userId: string;
  email: string | null;
  bio: string | null;
}

export async function getProfile(userId: string): Promise<{
  profile: ProfileRow | null;
  settings: SettingsRow;
}> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
  const settings = await getSettings(userId);
  return {
    profile: profile
      ? { userId: profile.userId, email: profile.email, bio: profile.bio }
      : null,
    settings,
  };
}

export async function updateProfile(
  userId: string,
  input: { bio?: string },
): Promise<void> {
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId));
  if (existing) {
    await db.update(profiles).set(input).where(eq(profiles.id, existing.id));
  } else {
    await db.insert(profiles).values({ userId, ...input });
  }
}
