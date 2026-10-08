import type { Request, Response } from "express";
import { authPort, nodeHeaders } from "../auth.js";

export const sessionController = {
  async getSession(req: Request, res: Response): Promise<void> {
    const payload = await authPort.getSession(nodeHeaders(req.headers));
    if (!payload) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    res.json(payload);
  },
};
