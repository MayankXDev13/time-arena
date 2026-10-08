import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { categories } from "@/db/app-schema";
import { eq } from "drizzle-orm";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "./categories";

const userId = `test-cats-${randomUUID()}`;

afterAll(async () => {
  await db.delete(categories).where(eq(categories.userId, userId));
});

describe("categories queries (Convex parity)", () => {
  it("creates, lists, updates and removes categories", async () => {
    const initial = await listCategories(userId);
    expect(initial).toEqual([]);

    const id = await createCategory({
      userId,
      name: "Deep Work",
      color: "#ff0000",
    });
    expect(typeof id).toBe("string");

    let list = await listCategories(userId);
    expect(list.length).toBe(1);
    expect(list[0].name).toBe("Deep Work");

    await updateCategory(id, { name: "Focus", color: "#00ff00" });
    list = await listCategories(userId);
    expect(list[0].name).toBe("Focus");
    expect(list[0].color).toBe("#00ff00");

    await deleteCategory(id);
    list = await listCategories(userId);
    expect(list).toEqual([]);
  });
});
