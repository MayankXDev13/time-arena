import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedLayout } from "./routes/ProtectedLayout.js";

vi.mock("@/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

import { authClient } from "@/auth-client";

const mockedUseSession = authClient.useSession as unknown as ReturnType<typeof vi.fn>;

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/signin" element={<p>signin page</p>} />
        <Route
          path="/*"
          element={
            <ProtectedLayout>
              <p>protected content</p>
            </ProtectedLayout>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("protected routing (issue 007)", () => {
  it("redirects unauthenticated visitors to /signin", async () => {
    mockedUseSession.mockReturnValue({ data: null, isPending: false });
    renderAt("/");
    await waitFor(() => {
      expect(screen.getByText("signin page")).toBeDefined();
    });
  });

  it("renders protected content when authenticated", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { id: "u1", email: "a@b.c" } },
      isPending: false,
    });
    renderAt("/");
    await waitFor(() => {
      expect(screen.getByText("protected content")).toBeDefined();
    });
  });
});
