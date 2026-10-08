import { Router } from "express";
import { sessionController } from "../controllers/session.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const sessionRoutes: Router = Router();

sessionRoutes.get("/session", requireAuth, sessionController.getSession);
