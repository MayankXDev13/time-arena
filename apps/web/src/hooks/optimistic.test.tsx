import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCategories, useUpdateCategory } from "./useCategories.js";
import { useSettingsQuery, useUpdateSettings } from "./useSettings.js";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" }, loading: false, isAuthenticated: true }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const CATS = [{ id: "c1", userId: "u1", name: "Work", color: "bg-blue-500" }];
const SETTINGS = {
  userId: "u1",
  streakThresholdMinutes: 15,
  autoStartBreaks: true,
  soundEnabled: true,
  defaultTimerMinutes: 25,
  breakDurationMinutes: 5,
  theme: "system",
};

function CategoriesProbe({ onWrite }: { onWrite: (body: unknown) => Promise<unknown> }) {
  const { data } = useCategories();
  const update = useUpdateCategory();
  return (
    <div>
      <p>{`name:${data?.[0]?.name}`}</p>
      <button
        type="button"
        onClick={() =>
          update.mutate(
            { id: "c1", name: "Play", color: "bg-red-500" },
            { onError: () => onWrite(null) },
          )
        }
      >
        rename
      </button>
    </div>
  );
}

describe("optimistic mutations with rollback", () => {
  it("shows the rename instantly, then rolls back when the write fails", async () => {
    const user = userEvent.setup();
    let releaseWrite!: (value: unknown) => void;
    const writeGate = new Promise<unknown>((resolve) => {
      releaseWrite = resolve;
    });
    const writes: unknown[] = [];
    global.fetch = vi.fn(async (url: unknown, init?: RequestInit) => {
      if (typeof url === "string" && url.endsWith("/api/categories") && init?.method !== "PATCH") {
        return { ok: true, json: async () => CATS };
      }
      writes.push(init?.body);
      return writeGate;
    }) as unknown as typeof fetch;

    let writeFailed = false;
    renderWithClient(
      <CategoriesProbe
        onWrite={() => {
          writeFailed = true;
          return Promise.resolve();
        }}
      />,
    );
    await waitFor(() => expect(screen.getByText("name:Work")).toBeDefined());

    await user.click(screen.getByRole("button", { name: "rename" }));
    // Optimistic value is visible while the write is still in flight…
    await waitFor(() => expect(screen.getByText("name:Play")).toBeDefined());
    expect(writes).toHaveLength(1);

    // …then the failed write rolls back to the server value.
    releaseWrite({ ok: false, status: 500, json: async () => ({}) });
    await waitFor(() => expect(screen.getByText("name:Work")).toBeDefined());
    await waitFor(() => expect(writeFailed).toBe(true));
  });

  it("shows the settings patch instantly, then rolls back when the write fails", async () => {
    const user = userEvent.setup();
    let releaseWrite!: (value: unknown) => void;
    const writeGate = new Promise<unknown>((resolve) => {
      releaseWrite = resolve;
    });
    global.fetch = vi.fn(async (url: unknown, init?: RequestInit) => {
      if (typeof url === "string" && url.endsWith("/api/settings") && init?.method !== "PATCH") {
        return { ok: true, json: async () => SETTINGS };
      }
      return writeGate;
    }) as unknown as typeof fetch;

    renderWithClient(<SettingsProbe />);
    await waitFor(() => expect(screen.getByText("theme:system")).toBeDefined());

    await user.click(screen.getByRole("button", { name: "darken" }));
    await waitFor(() => expect(screen.getByText("theme:dark")).toBeDefined());

    releaseWrite({ ok: false, status: 500, json: async () => ({}) });
    await waitFor(() => expect(screen.getByText("theme:system")).toBeDefined());
  });
});

function SettingsProbe() {
  const { data } = useSettingsQuery();
  const update = useUpdateSettings();
  return (
    <div>
      <p>{`theme:${data?.theme}`}</p>
      <button type="button" onClick={() => update.mutate({ theme: "dark" })}>
        darken
      </button>
    </div>
  );
}
