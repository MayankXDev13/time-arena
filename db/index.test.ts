import { describe, expect, it } from "vitest";

describe("db client", () => {
  it("exports a query-ready db built from DATABASE_URL without connecting", async () => {
    process.env.DATABASE_URL ??=
      "postgresql://test:test@localhost:5432/test";
    const { db } = await import("./index");
    expect(db).toBeDefined();
  });
});
