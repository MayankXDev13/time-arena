import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TimeArenaPanel } from "./TimeArenaPanel.js";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderPanel(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("TimeArenaPanel", () => {
  it("renders the live timer snapshot and cache footprint", () => {
    renderPanel(<TimeArenaPanel />);
    expect(screen.getByText("timer")).toBeDefined();
    expect(screen.getByText("idle")).toBeDefined();
    expect(screen.getByText("mode")).toBeDefined();
    expect(screen.getByText("cached queries")).toBeDefined();
    expect(screen.getByText("fetching")).toBeDefined();
  });
});
