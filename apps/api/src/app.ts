import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "./logger.js";
import { authRoutes } from "./routes/auth.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { sessionRoutes } from "./routes/session.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";
import { usersRoutes } from "./routes/users.routes.js";

export function createApp(): express.Express {
  const app = express();
  app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:3001"],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      genReqId: () => randomUUID(),
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api", sessionRoutes);
  app.use("/api", categoryRoutes);
  app.use("/api", usersRoutes);
  app.use("/api", uploadRoutes);

  // Central error handler: never leak stack traces over HTTP.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(
    (
      err: unknown,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      req.log.error({ err }, "unhandled request error");
      res.status(500).json({ error: "internal_error" });
    },
  );

  return app;
}
