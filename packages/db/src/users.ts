import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userSettings = pgTable(
  "userSettings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    streakThresholdMinutes: integer("streakThresholdMinutes")
      .notNull()
      .default(15),
    autoStartBreaks: boolean("autoStartBreaks").default(true),
    soundEnabled: boolean("soundEnabled").default(true),
    defaultTimerMinutes: integer("defaultTimerMinutes").default(25),
    breakDurationMinutes: integer("breakDurationMinutes").default(5),
    theme: text("theme").default("system"),
  },
  (t) => [uniqueIndex("user_settings_user_uidx").on(t.userId)],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    email: text("email"),
    bio: text("bio"),
  },
  (t) => [uniqueIndex("profiles_user_uidx").on(t.userId)],
);
