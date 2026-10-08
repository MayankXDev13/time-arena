import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import { account, session, user, verification } from "./auth-schema";

describe("better-auth drizzle schema (generated)", () => {
  it("has a user table with email identity", () => {
    expect(getTableConfig(user).name).toBe("user");
    const cols = getTableConfig(user).columns.map((c) => c.name);
    expect(cols).toContain("email");
  });

  it("has session, account and verification tables", () => {
    expect(getTableConfig(session).name).toBe("session");
    expect(getTableConfig(account).name).toBe("account");
    expect(getTableConfig(verification).name).toBe("verification");
  });
});
