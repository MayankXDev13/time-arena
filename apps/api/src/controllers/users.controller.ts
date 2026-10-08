import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/requireAuth.js";
import {
  getProfile,
  getSettings,
  updateProfile,
  updateSettings,
} from "../services/user.service.js";

const settingsPatchSchema = z.object({
  streakThresholdMinutes: z.number().int().min(1).max(180).optional(),
  autoStartBreaks: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  defaultTimerMinutes: z.number().int().min(1).max(180).optional(),
  breakDurationMinutes: z.number().int().min(1).max(120).optional(),
  theme: z.string().min(1).max(20).optional(),
});

const profilePatchSchema = z.object({
  bio: z.string().max(1000).optional(),
});

function userIdOf(req: Request): string {
  return (req as AuthenticatedRequest).userId;
}

export const settingsController = {
  async get(req: Request, res: Response): Promise<void> {
    res.json(await getSettings(userIdOf(req)));
  },

  async update(req: Request, res: Response): Promise<void> {
    const parsed = settingsPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    await updateSettings(userIdOf(req), parsed.data);
    res.json({ success: true });
  },
};

export const profileController = {
  async get(req: Request, res: Response): Promise<void> {
    res.json(await getProfile(userIdOf(req)));
  },

  async update(req: Request, res: Response): Promise<void> {
    const parsed = profilePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    await updateProfile(userIdOf(req), parsed.data);
    res.json({ success: true });
  },
};
