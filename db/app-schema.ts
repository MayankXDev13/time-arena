import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    categoryId: uuid("categoryId"),
    start: bigint("start", { mode: "number" }).notNull(),
    endedAt: bigint("endedAt", { mode: "number" }),
    duration: integer("duration").notNull(),
    mode: text("mode").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
  },
  (t) => [index("categories_user_idx").on(t.userId)],
);

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
