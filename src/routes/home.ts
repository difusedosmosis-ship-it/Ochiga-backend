import express from "express";
import { supabaseAdmin } from "../supabase/client";

const router = express.Router();

router.post("/create-home", async (req, res) => {
  try {
    const body = req.body;

    // 1 — create resident user
    const tempPassword = "OC-" + Math.floor(10000 + Math.random() * 90000);

    const { data: resident, error: residentErr } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: body.residentEmail,
          password: tempPassword,
          full_name: body.residentName,
          role: "resident",
          estate_id: body.estateId,
        },
      ])
      .select()
      .single();

    if (residentErr) return res.status(400).json({ message: residentErr.message });

    // 2 — create home
    const { data: home, error: homeErr } = await supabaseAdmin
      .from("homes")
      .insert([
        {
          name: body.name,
          unit: body.unit,
          block: body.block,
          estate_id: body.estateId,
          resident_id: resident.id,
          description: body.description,
          electricityMeter: body.electricityMeter,
          waterMeter: body.waterMeter,
          internetId: body.internetId,
          gateCode: body.gateCode,
        },
      ])
      .select()
      .single();

    if (homeErr) return res.status(400).json({ message: homeErr.message });

    return res.json({
      message: "Home created successfully",
      resident: {
        email: body.residentEmail,
        tempPassword,
      },
      home,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
