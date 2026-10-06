import { describe, expect, it } from "vitest";
import { auth } from "./auth";

describe("auth config (email + Google + GitHub on Neon)", () => {
  it("enables email and password auth", () => {
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
  });

  it("configures Google and GitHub social providers", () => {
    const providers = auth.options.socialProviders ?? {};
    expect(Object.keys(providers).sort()).toEqual(["github", "google"]);
  });
});
