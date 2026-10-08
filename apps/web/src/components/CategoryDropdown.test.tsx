import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryDropdown } from "./CategoryDropdown.js";

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

describe("CategoryDropdown lock (timer running)", () => {
  it("opens the menu when enabled", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: "c1", userId: "u1", name: "Work", color: "bg-blue-500" }],
    })) as unknown as typeof fetch;

    renderWithClient(
      <CategoryDropdown selectedCategoryId={undefined} onSelect={() => {}} />,
    );
    await user.click(screen.getByRole("button", { name: /select category/i }));
    expect(screen.getByText("Work")).toBeDefined();
  });

  it("stays shut and disabled when the timer is running", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [{ id: "c1", userId: "u1", name: "Work", color: "bg-blue-500" }],
    })) as unknown as typeof fetch;

    renderWithClient(
      <CategoryDropdown
        selectedCategoryId={undefined}
        onSelect={onSelect}
        disabled
      />,
    );
    const trigger = screen.getByRole("button", { name: /select category/i });
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    // Auto-select may fire on mount; user interaction must not.
    await waitFor(() => expect(onSelect).toHaveBeenCalled());
    onSelect.mockClear();
    await user.click(trigger);
    expect(screen.queryByText("Work")).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
