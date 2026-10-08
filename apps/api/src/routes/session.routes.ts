import { Router } from "express";
import { sessionController } from "../controllers/session.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const sessionRoutes: Router = Router();

sessionRoutes.get("/session", requireAuth, sessionController.getSession);
// Static sub-paths before :id so they are not swallowed as ids.
sessionRoutes.get("/sessions/recent", requireAuth, sessionController.recent);
sessionRoutes.get("/sessions/stats", requireAuth, sessionController.stats);
sessionRoutes.get(
  "/sessions/contributions",
  requireAuth,
  sessionController.contributions,
);
sessionRoutes.get("/sessions", requireAuth, sessionController.history);
sessionRoutes.post("/sessions", requireAuth, sessionController.create);
sessionRoutes.patch("/sessions/:id", requireAuth, sessionController.patch);
sessionRoutes.delete("/sessions/:id", requireAuth, sessionController.remove);
