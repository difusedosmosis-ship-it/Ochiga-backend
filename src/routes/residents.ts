import express from "express";
import { supabaseAdmin } from "../supabase/client";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import crypto from "crypto";
import QRCode from "qrcode";

const router = express.Router();

/** POST /residents  — Create resident user + onboarding link */
router.post("/", requireAuth, requireRole("estate"), async (req, res) => {
  const { email, estateId, homeId } = req.body;

  if (!email || !estateId) {
    return res.status(400).json({ error: "email and estateId required" });
  }

  try {
    // 1. Create temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // 2. Create resident user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email,
          username: null,
          password: tempPassword,
          estate_id: estateId,
          home_id: homeId || null,
          isResident: true,
          isEstateOwner: false,
        },
      ])
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    // 3. Create onboarding token
    const token = crypto.randomUUID();

    const { error: tokenError } = await supabaseAdmin
      .from("onboarding_tokens")
      .insert([
        {
          user_id: user.id,
          token,
          used: false,
        },
      ]);

    if (tokenError) {
      return res.status(500).json({ error: tokenError.message });
    }

    // 4. Generate onboarding link
    const onboardingUrl = `https://your-domain.com/onboard/${token}`;

    // 5. Generate QR Code (base64)
    const qrDataUrl = await QRCode.toDataURL(onboardingUrl);

    // (Email sending would go here)

    // 6. Return full details to estate dashboard
    return res.json({
      message: "Resident created & onboarding link generated",
      user,
      onboardingUrl,
      qrDataUrl,
      tempPassword,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
