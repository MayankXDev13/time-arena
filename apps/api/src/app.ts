import cors from "cors";
import express from "express";

export function createApp(): express.Express {
  const app = express();
  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
  });

  return app;
}
