import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import { auth } from "../auth.js";

export const authRoutes: Router = Router();

// better-auth owns every /api/auth/* path (sign-up, sign-in, social, session).
authRoutes.all("/*", (req, res) => toNodeHandler(auth)(req, res));
