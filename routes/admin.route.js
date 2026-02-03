import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/org.middleware.js";
import {
  adminCreateTask,
  deleteTask,
  getAllTasks,
} from "../controllers/admin.controller.js";
import { updateTaskById } from "../controllers/task.controller.js";
import { User } from "../models/user.model.js";

const router = Router();

/* TASKS (created by admin & assigned to other members) */
router.get("/admin/tasks", requireAuth, requireAdmin, getAllTasks);
router.post("/admin/tasks", requireAuth, requireAdmin, adminCreateTask);
router.patch("/admin/tasks/:id", requireAuth, requireAdmin, updateTaskById);
router.delete("/admin/tasks/:id", requireAuth, requireAdmin, deleteTask);

/* USERS (tenant safe) */
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find().select("_id name email");
  res.json(users);
});

export default router;
