import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createTask, deleteTaskById, getMyTasks, getTaskById, markDone, updateTaskById } from "../controllers/task.controller.js";



const router = Router();

router.post("/tasks", requireAuth, createTask);

// get tasks (own for USER, all for ADMIN)
router.get("/tasks", requireAuth, getMyTasks);

// get single task (ownership enforced in controller)
router.get("/tasks/:id", requireAuth, getTaskById);

// update task (owner or admin)
router.put("/tasks/:id", requireAuth, updateTaskById);

// delete task (owner or admin)
router.delete("/tasks/:id", requireAuth, deleteTaskById);

// mark task as done (owner only)
router.patch("/tasks/:id/mark-done", requireAuth, markDone);
export default router;
