import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/app-schema";

export interface CategoryRow {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export async function listCategories(userId: string): Promise<CategoryRow[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));
}

export async function createCategory(input: {
  userId: string;
  name: string;
  color: string;
}): Promise<string> {
  const [row] = await db
    .insert(categories)
    .values(input)
    .returning({ id: categories.id });
  return row.id;
}

export async function updateCategory(
  id: string,
  input: { name: string; color: string },
): Promise<void> {
  await db
    .update(categories)
    .set({ name: input.name, color: input.color })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}

const DEFAULT_CATEGORIES = [
  { name: "Other", color: "bg-gray-500" },
  { name: "Work", color: "bg-blue-500" },
  { name: "Study", color: "bg-green-500" },
] as const;

/**
 * Insert the starter categories for a user that has none.
 * The zero-check lives server-side so concurrent callers (two tabs,
 * a re-run effect, StrictMode) collapse into at most one seed batch
 * instead of fanning out into duplicate rows. Returns true when this
 * call performed the insert.
 */
export async function seedDefaultCategories(userId: string): Promise<boolean> {
  const [{ value: existing }] = await db
    .select({ value: count() })
    .from(categories)
    .where(eq(categories.userId, userId));
  if (existing > 0) return false;

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({ userId, name: c.name, color: c.color })),
  );
  return true;
}
