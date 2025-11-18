import { Router } from "express";
import { AuthService } from "./auth.service";

const router = Router();

router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const result = await authService.login({ usernameOrEmail, password });
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
