import { eq } from "drizzle-orm";
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
