import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../supabase/supabaseClient";

export type AuthedRequest = Request & { user?: any };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Missing authorization header" });

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid auth header" });
    }

    const token = parts[1];

    // ✅ Verify Supabase JWT
    const { data: user, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user info to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ message: "Authentication failed" });
  }
}
