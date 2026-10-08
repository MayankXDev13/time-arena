import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
  },
  (t) => [index("categories_user_idx").on(t.userId)],
);
