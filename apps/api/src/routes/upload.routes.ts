import { Router } from "express";

export const uploadRoutes: Router = Router();

// Preserved stub: legacy ships an empty /api/upload path with no behavior.
// Explicit 501 beats a silent 404 so future work has a defined contract.
uploadRoutes.all("/upload", (_req, res) => {
  res.status(501).json({ error: "not_implemented" });
});
