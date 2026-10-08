import { bigint, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    categoryId: uuid("categoryId"),
    start: bigint("start", { mode: "number" }).notNull(),
    endedAt: bigint("endedAt", { mode: "number" }),
    duration: integer("duration").notNull(),
    mode: text("mode").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);
