import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/auth-schema.ts", "./src/sessions.ts", "./src/categories.ts", "./src/users.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
