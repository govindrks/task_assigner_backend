import { Router } from "express";
import { adminCreateTask, deleteTask, getAllTasks, updateStatus } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/adminOnly.middleware.js";



const router = Router();

router.get("/admin/tasks", requireAuth, adminOnly, getAllTasks);
router.post("/admin/tasks", requireAuth, adminOnly, adminCreateTask);
router.patch("/admin/tasks/:id/status", requireAuth, adminOnly, updateStatus);
router.delete("/admin/tasks/:id", requireAuth, adminOnly, deleteTask);
export default router;