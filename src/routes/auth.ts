import express from "express";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../supabase/client";
import { signToken } from "../utils/jwt";

const router = express.Router();

/**
 * POST /auth/signup
 * body: { email, password, username, role, estateId? }
 */
router.post("/signup", async (req, res) => {
  const { email, password, username, role = "resident", estateId = null } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  // check existing
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (existing && existing.length) return res.status(400).json({ error: "Email already used" });

  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert([{ email, username, password_hash: hash, role, estate_id: estateId }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const token = signToken({ sub: data.id, role: data.role, email: data.email });

  res.json({ user: { id: data.id, email: data.email, role: data.role, username: data.username }, token });
});

/**
 * POST /auth/login
 * body: { usernameOrEmail, password }
 */
router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) return res.status(400).json({ error: "Missing credentials" });

  // find by email or username
  const { data } = await supabaseAdmin
    .from("users")
    .select("*")
    .or(`email.eq.${usernameOrEmail},username.eq.${usernameOrEmail}`)
    .limit(1)
    .single();

  if (!data) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: data.id, role: data.role, email: data.email });
  // minimal user object for frontend
  res.json({ user: { id: data.id, role: data.role, email: data.email, username: data.username, estate_id: data.estate_id }, token });
});

export default router;
