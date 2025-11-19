import express from "express";
import bcrypt from "bcrypt";
import { supabaseAdmin } from "../supabase/client";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = express.Router();

/** GET /estates - list (admin/estate) */
router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("estates").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** POST /estates - create estate (estate role or admin) */
router.post("/", requireAuth, requireRole("estate"), async (req, res) => {
  const { name, address } = req.body;
  const { data, error } = await supabaseAdmin
    .from("estates")
    .insert([{ name, address }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** GET /estates/:id */
router.get("/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin
    .from("estates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

/* -------------------------------------------- */
/*   NEW: CREATE HOME + RESIDENT ACCOUNT        */
/* -------------------------------------------- */

router.post("/create-home", requireAuth, requireRole("estate"), async (req, res) => {
  try {
    const dto = req.body;

    // generate resident password
    const tempPassword = "OC-" + Math.floor(10000 + Math.random() * 90000);
    const hashedPw = await bcrypt.hash(tempPassword, 10);

    /** 1️⃣ Create resident user in users table */
    const { data: resident, error: residentErr } = await supabaseAdmin
      .from("users")
      .insert({
        email: dto.residentEmail,
        password: hashedPw,
        role: "resident",
        estate_id: dto.estateId,
        full_name: dto.residentName,
      })
      .select()
      .single();

    if (residentErr) {
      console.error(residentErr);
      return res.status(400).json({
        message: "Error saving resident",
        error: residentErr.message,
      });
    }

    /** 2️⃣ Save home */
    const { data: home, error: homeErr } = await supabaseAdmin
      .from("homes")
      .insert({
        name: dto.name,
        unit: dto.unit,
        block: dto.block,
        estate_id: dto.estateId,
        resident_id: resident.id,
        description: dto.description,
        electricityMeter: dto.electricityMeter,
        waterMeter: dto.waterMeter,
        internetId: dto.internetId,
        gateCode: dto.gateCode,
      })
      .select()
      .single();

    if (homeErr) {
      console.error(homeErr);
      return res.status(400).json({
        message: "Error saving home",
        error: homeErr.message,
      });
    }

    return res.json({
      message: "Home created successfully",
      resident: {
        email: dto.residentEmail,
        tempPassword,
      },
      home,
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

export default router;
