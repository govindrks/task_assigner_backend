import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireMember, requireAdmin } from "../middleware/org.middleware.js";
import {
  createTask,
  deleteTaskById,
  getTasks,
  updateTaskById,
} from "../controllers/task.controller.js";

const router = Router();

/* list */
router.get("/tasks", requireAuth, requireMember, getTasks);

/* create (admin) */
router.post("/tasks", requireAuth, requireAdmin, createTask);

/* single */
//router.get("/tasks/:id", requireAuth, requireMember, getMyTasks);

/* update */
router.patch("/tasks/:id", requireAuth, requireMember, updateTaskById);

/* delete */
router.delete("/tasks/:id", requireAuth, requireAdmin, deleteTaskById);

export default router;
