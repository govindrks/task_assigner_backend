import { Router } from "express";


import { requireAuth } from "../middleware/auth.middleware.js";
import { User } from "../models/user.model.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
