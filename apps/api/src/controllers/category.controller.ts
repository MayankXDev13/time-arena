import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/requireAuth.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  seedDefaultCategories,
  updateCategory,
} from "../services/category.service.js";

const categoryBodySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().min(1).max(50),
});

function userIdOf(req: Request): string {
  return (req as AuthenticatedRequest).userId;
}

export const categoryController = {
  async list(req: Request, res: Response): Promise<void> {
    res.json(await listCategories(userIdOf(req)));
  },

  async create(req: Request, res: Response): Promise<void> {
    const parsed = categoryBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const id = await createCategory({ userId: userIdOf(req), ...parsed.data });
    res.status(201).json({ id });
  },

  async update(req: Request, res: Response): Promise<void> {
    const parsed = categoryBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const ok = await updateCategory(
      req.params.id as string,
      userIdOf(req),
      parsed.data,
    );
    if (!ok) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ success: true });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const ok = await deleteCategory(req.params.id as string, userIdOf(req));
    if (!ok) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ success: true });
  },

  async seed(req: Request, res: Response): Promise<void> {
    const seeded = await seedDefaultCategories(userIdOf(req));
    res.json({ seeded });
  },
};
