import { Router } from "express";
import {
  adminCreateTask,
  deleteTask,
  getAllTasks,
  updateStatus,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/adminOnly.middleware.js";
import { User } from "../models/user.model.js";
import { adminUpdateTaskById } from "../controllers/admin.controller.js";
const router = Router();

/* ================= TASK MANAGEMENT ================= */

router.get("/admin/tasks", requireAuth, adminOnly, getAllTasks);

router.post("/admin/tasks", requireAuth, adminOnly, adminCreateTask);

router.patch("/admin/tasks/:id/status", requireAuth, adminOnly, updateStatus);

router.delete("/admin/tasks/:id", requireAuth, adminOnly, deleteTask);

router.put("/admin/tasks/:id", requireAuth, adminOnly, adminUpdateTaskById);

/* ================= USER LIST (FOR ASSIGNMENT) ================= */

// 🔥 REQUIRED FOR assignedTo DROPDOWN
// GET all users (admin only)
router.get("/admin/users", requireAuth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("_id name email"); // 🔐 no password

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
