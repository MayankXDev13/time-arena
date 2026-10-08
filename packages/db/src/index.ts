import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as authSchema from "./auth-schema.js";

const sql = neon(process.env.DATABASE_URL ?? "");

// Mirrors the legacy app: plain client here, schema handed to the
// better-auth drizzle adapter by the consumer (apps/api).
export const db = drizzle(sql);

export { authSchema };

export * from "./auth-schema.js";
export * from "./categories.js";
export * from "./sessions.js";
