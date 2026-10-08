import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/auth-client";
import { useAuth } from "./useAuth.js";

vi.mock("@/auth-client", () => ({
  authClient: {
    useSession: vi.fn(() => ({ data: null, isPending: false })),
    signIn: {
      social: vi.fn(async () => ({ error: null })),
    },
  },
}));

const mockedSocial = authClient.signIn.social as unknown as ReturnType<typeof vi.fn>;

describe("social callback URL (fix/social-callback-url)", () => {
  beforeEach(() => {
    mockedSocial.mockClear();
  });

  it("sends GitHub sign-in back to the SPA origin, not the API", async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.signInWithGitHub();
    expect(mockedSocial).toHaveBeenCalledOnce();
    const callbackURL = mockedSocial.mock.calls[0][0].callbackURL as string;
    expect(callbackURL).toContain("localhost:5173");
    expect(callbackURL).not.toContain("localhost:3000");
  });

  it("sends Google sign-in back to the SPA origin, not the API", async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.signInWithGoogle();
    expect(mockedSocial).toHaveBeenCalledOnce();
    const callbackURL = mockedSocial.mock.calls[0][0].callbackURL as string;
    expect(callbackURL).toContain("localhost:5173");
    expect(callbackURL).not.toContain("localhost:3000");
  });
});
