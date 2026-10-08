import { describe, expect, it } from "vitest";
import {
  accountKeys,
  categoryKeys,
  profileKeys,
  sessionKeys,
  settingsKeys,
} from "./query-keys.js";

describe("domain query keys", () => {
  it("nests every session scope under one prefix", () => {
    const filters = { limit: 10, mode: "work" as const };
    expect(sessionKeys.list(filters)[0]).toBe("sessions");
    expect(sessionKeys.recent(5)[0]).toBe("sessions");
    expect(sessionKeys.stats()[0]).toBe("sessions");
    expect(sessionKeys.contributions(2026)[0]).toBe("sessions");
  });

  it("separates filter variants while sharing the list parent", () => {
    const a = sessionKeys.list({ limit: 10 });
    const b = sessionKeys.list({ limit: 10, mode: "break" });
    expect(a).not.toEqual(b);
    expect(a.slice(0, 2)).toEqual(sessionKeys.lists());
    expect(b.slice(0, 2)).toEqual(sessionKeys.lists());
  });

  it("keeps each domain on its own top-level key", () => {
    expect(categoryKeys.list()[0]).toBe("categories");
    expect(settingsKeys.detail()[0]).toBe("settings");
    expect(profileKeys.detail()[0]).toBe("profile");
    expect(accountKeys.list()[0]).toBe("linkedAccounts");
  });
});
