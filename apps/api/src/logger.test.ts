import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createLogger } from "./logger.js";

describe("request logging (pino)", () => {
  it("honors LOG_LEVEL with an info default", () => {
    expect(createLogger({}).level).toBe("info");
    expect(createLogger({ LOG_LEVEL: "debug" }).level).toBe("debug");
    expect(createLogger({ LOG_LEVEL: "silent" })).toBeDefined();
  });

  it("serves requests with logging middleware attached", async () => {
    const app = createApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, service: "api" });
  });
});
