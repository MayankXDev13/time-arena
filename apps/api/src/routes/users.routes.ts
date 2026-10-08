import { Router } from "express";
import {
  profileController,
  settingsController,
} from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const usersRoutes: Router = Router();

usersRoutes.get("/settings", requireAuth, settingsController.get);
usersRoutes.patch("/settings", requireAuth, settingsController.update);
usersRoutes.get("/profile", requireAuth, profileController.get);
usersRoutes.patch("/profile", requireAuth, profileController.update);
