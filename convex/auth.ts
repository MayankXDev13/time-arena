import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const isValidOAuthConfig = (clientId: string | undefined, clientSecret: string | undefined) => {
  return clientId && 
         clientSecret && 
         clientId !== "your_github_client_id" && 
         clientId !== "your_google_client_id" &&
         clientId.length > 10;
};

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const authOptions: any = {
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig })],
  };

  if (isValidOAuthConfig(githubClientId, githubClientSecret)) {
    authOptions.github = {
      clientId: githubClientId!,
      clientSecret: githubClientSecret!,
    };
  }

  if (isValidOAuthConfig(googleClientId, googleClientSecret)) {
    authOptions.google = {
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    };
  }

  return betterAuth(authOptions);
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
