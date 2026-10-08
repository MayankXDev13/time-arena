import { describe, expect, it, vi, beforeEach } from "vitest";
import { api } from "./api";

function mockFetch(response: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("api client (REST contract)", () => {
  it("fetches stats from /api/sessions/stats", async () => {
    const stats = { todayMinutes: 10 };
    globalThis.fetch = mockFetch(stats) as never;

    await expect(api.getStats()).resolves.toEqual(stats);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/sessions/stats", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("creates a session via POST with JSON body", async () => {
    globalThis.fetch = mockFetch({ id: "abc" }) as never;

    const res = await api.createSession({
      start: 123,
      duration: 0,
      mode: "work",
    });
    expect(res).toEqual({ id: "abc" });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/sessions", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ start: 123, duration: 0, mode: "work" }),
    });
  });

  it("ends a session via PATCH with endedAt", async () => {
    globalThis.fetch = mockFetch({ success: true }) as never;

    await api.endSession("abc", { endedAt: 999, duration: 60 });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/sessions/abc", {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify({ endedAt: 999, duration: 60 }),
    });
  });

  it("fetches history with query params", async () => {
    const page = { page: [], totalCount: 0 };
    globalThis.fetch = mockFetch(page) as never;

    await api.getHistory({ limit: 10, mode: "work" });
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe("/api/sessions?limit=10&mode=work");
  });

  it("deletes via DELETE and throws on error status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as never;

    await expect(api.deleteSession("abc")).rejects.toThrow("500");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/sessions/abc", {
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });
  });

  it("updates settings via PATCH", async () => {
    globalThis.fetch = mockFetch({ success: true }) as never;

    await api.updateSettings({ theme: "dark" });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/settings", {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify({ theme: "dark" }),
    });
  });

  it("creates a category via POST", async () => {
    globalThis.fetch = mockFetch({ id: "c1" }) as never;

    await api.createCategory({ name: "Work", color: "bg-blue-500" });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/categories", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ name: "Work", color: "bg-blue-500" }),
    });
  });

  it("fetches contributions with year param", async () => {
    globalThis.fetch = mockFetch([]) as never;

    await api.getContributions(2026);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/sessions/contributions?year=2026",
      { headers: { "Content-Type": "application/json" } },
    );
  });
});
