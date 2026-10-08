import type { NextFunction, Request, Response } from "express";
import { authPort, nodeHeaders } from "../auth.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const payload = await authPort.getSession(nodeHeaders(req.headers));
  if (!payload) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  (req as AuthenticatedRequest).userId = payload.user.id;
  next();
}
