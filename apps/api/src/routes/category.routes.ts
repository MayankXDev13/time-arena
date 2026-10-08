import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const categoryRoutes: Router = Router();

// Static sub-path before :id so it is not swallowed as an id.
categoryRoutes.post("/categories/seed", requireAuth, categoryController.seed);
categoryRoutes.get("/categories", requireAuth, categoryController.list);
categoryRoutes.post("/categories", requireAuth, categoryController.create);
categoryRoutes.patch("/categories/:id", requireAuth, categoryController.update);
categoryRoutes.delete("/categories/:id", requireAuth, categoryController.remove);
