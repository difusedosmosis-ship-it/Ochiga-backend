// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthedRequest = Request & {
  user?: { id: string; role: string; email?: string };
};

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
if (!SUPABASE_JWT_SECRET) {
  throw new Error("Missing SUPABASE_JWT_SECRET in environment");
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization header" });

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid authorization header" });

  const token = parts[1];

  try {
    // Verify Supabase JWT
    const payload: any = jwt.verify(token, SUPABASE_JWT_SECRET);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || "resident", // fallback if role not in JWT
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
