import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { User } from "../models/user.model.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
});

export default router;
