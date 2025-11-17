import express from "express";
import { supabaseAdmin } from "../supabase/client";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = express.Router();

/** GET /devices?estateId= - list devices */
router.get("/", requireAuth, async (req, res) => {
  const estateId = req.query.estateId as string | undefined;
  const q = supabaseAdmin.from("devices").select("*").maybeSingle();
  // simple filtering
  const { data, error } = estateId
    ? await supabaseAdmin.from("devices").select("*").eq("estate_id", estateId)
    : await supabaseAdmin.from("devices").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** POST /devices - create device (estate role) */
router.post("/", requireAuth, requireRole("estate"), async (req, res) => {
  const { estate_id, name, type, metadata } = req.body;
  const { data, error } = await supabaseAdmin.from("devices").insert([{ estate_id, name, type, metadata }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** POST /devices/:id/action - trigger a device action (placeholder) */
router.post("/:id/action", requireAuth, async (req, res) => {
  const id = req.params.id;
  const { action, params } = req.body;
  // placeholder: in production you will publish to MQTT, push to device gateway API, etc.
  console.log("Trigger device", id, action, params);
  res.json({ ok: true, message: `Action ${action} queued for device ${id}` });
});

export default router;
