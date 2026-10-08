import type { Request, Response } from "express";
import { z } from "zod";
import { authPort, nodeHeaders } from "../auth.js";
import type { AuthenticatedRequest } from "../middleware/requireAuth.js";
import {
  createSession,
  deleteSession,
  endSession,
  getRecentSessions,
  getSessionHistory,
  updateSession,
} from "../services/session.service.js";

const modeSchema = z.enum(["work", "break"]);

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  mode: modeSchema.optional(),
  startDate: z.coerce.number().optional(),
  endDate: z.coerce.number().optional(),
});

const createBodySchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  start: z.number(),
  duration: z.number().default(0),
  mode: modeSchema,
});

const updateBodySchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  duration: z.number().optional(),
  mode: modeSchema.optional(),
});

const endBodySchema = z.object({
  endedAt: z.number(),
  duration: z.number(),
});

function userIdOf(req: Request): string {
  return (req as AuthenticatedRequest).userId;
}

export const sessionController = {
  async getSession(req: Request, res: Response): Promise<void> {
    const payload = await authPort.getSession(nodeHeaders(req.headers));
    if (!payload) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    res.json(payload);
  },

  async history(req: Request, res: Response): Promise<void> {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_query" });
      return;
    }
    res.json(await getSessionHistory({ userId: userIdOf(req), ...parsed.data }));
  },

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const id = await createSession({ userId: userIdOf(req), ...parsed.data });
    res.status(201).json({ id });
  },

  async patch(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = userIdOf(req);
    let ok: boolean;
    if ("endedAt" in (req.body ?? {})) {
      const parsed = endBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "invalid_body" });
        return;
      }
      ok = await endSession(id, userId, parsed.data);
    } else {
      const parsed = updateBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "invalid_body" });
        return;
      }
      ok = await updateSession(id, userId, parsed.data);
    }
    if (!ok) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ success: true });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const ok = await deleteSession(
      req.params.id as string,
      userIdOf(req),
    );
    if (!ok) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ success: true });
  },

  async recent(req: Request, res: Response): Promise<void> {
    const parsed = z
      .object({
        limit: z.coerce.number().int().min(1).max(100).default(20),
        categoryId: z.string().uuid().optional(),
      })
      .safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_query" });
      return;
    }
    res.json(
      await getRecentSessions(userIdOf(req), parsed.data.limit, parsed.data.categoryId),
    );
  },
};
