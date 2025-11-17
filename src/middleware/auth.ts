import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export type AuthedRequest = Request & { user?: { id: string; role: string; email?: string } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization header" });

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid auth header" });

  const token = parts[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  req.user = { id: payload.sub, role: payload.role, email: payload.email };
  return next();
}
