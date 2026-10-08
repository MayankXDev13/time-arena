import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./lib/api.js";

describe("api client (issue 007)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("prefixes requests with the configured API base", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "s1" }),
    });

    const res = await api.createSession({
      categoryId: null,
      start: 123,
      duration: 600,
      mode: "work",
    });

    expect(res).toEqual({ id: "s1" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.endsWith("/api/sessions")).toBe(true);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({ mode: "work" });
  });

  it("encodes history filters as query params and surfaces HTTP errors", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        page: [],
        hasMore: false,
        totalPages: 0,
        totalCount: 0,
      }),
    });

    await api.getHistory({ limit: 10, mode: "work" });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/sessions?");
    expect(url).toContain("limit=10");
    expect(url).toContain("mode=work");

    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await expect(api.getStats()).rejects.toThrow("401");
  });
});
