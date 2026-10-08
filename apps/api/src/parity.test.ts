import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { loadEnv } from "./env.js";

describe("dev parity (issue 008)", () => {
  it("fails fast with a clear message when required env is missing", () => {
    expect(() => loadEnv({})).toThrowError(/DATABASE_URL.*BETTER_AUTH_SECRET/);
    expect(() => loadEnv({ DATABASE_URL: "x" })).toThrowError(/BETTER_AUTH_SECRET/);
    expect(() =>
      loadEnv({ DATABASE_URL: "x", BETTER_AUTH_SECRET: "y" }),
    ).not.toThrow();
  });

  it("preserves the upload path as an explicit stub", async () => {
    const app = createApp();
    const res = await request(app).post("/api/upload").send({});
    expect(res.status).toBe(501);
    expect(res.body).toEqual({ error: "not_implemented" });
  });
});
