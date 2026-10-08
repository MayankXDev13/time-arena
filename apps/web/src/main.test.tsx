import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Root } from "./main.js";

vi.mock("@/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

/**
 * Composition regression test: TanStackDevtools (including the Query panel,
 * which calls useQueryClient) must mount inside QueryClientProvider.
 * A misplaced mount crashes boot with "No QueryClient set".
 * Note: no unmount — the devtools shell throws on jsdom unmount, and this
 * file renders exactly once.
 */
describe("app root composition", () => {
  it("mounts the app with devtools without crashing", async () => {
    render(<Root />);
    // Unauthenticated: the guard redirects to the sign-in screen.
    await waitFor(() => expect(screen.getByText("Step back in")).toBeDefined());
  });
});
