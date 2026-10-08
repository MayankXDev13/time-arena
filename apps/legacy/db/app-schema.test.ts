import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  categories,
  profiles,
  sessions,
  userSettings,
} from "./app-schema";

function columnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((c) => c.name).sort();
}

describe("app schema (Neon, avatars dropped)", () => {
  it("exposes a sessions table", () => {
    expect(getTableConfig(sessions).name).toBe("sessions");
    expect(columnNames(sessions)).toEqual(
      ["id", "userId", "categoryId", "start", "endedAt", "duration", "mode"].sort(),
    );
  });

  it("exposes a categories table", () => {
    expect(getTableConfig(categories).name).toBe("categories");
    expect(columnNames(categories)).toEqual(
      ["id", "userId", "name", "color"].sort(),
    );
  });

  it("exposes a userSettings table", () => {
    expect(getTableConfig(userSettings).name).toBe("userSettings");
    expect(columnNames(userSettings)).toEqual(
      [
        "id",
        "userId",
        "streakThresholdMinutes",
        "autoStartBreaks",
        "soundEnabled",
        "defaultTimerMinutes",
        "breakDurationMinutes",
        "theme",
      ].sort(),
    );
  });

  it("exposes a profiles table without avatar storage (OAuth image only)", () => {
    expect(getTableConfig(profiles).name).toBe("profiles");
    expect(columnNames(profiles)).toEqual(
      ["id", "userId", "email", "bio"].sort(),
    );
  });
});
