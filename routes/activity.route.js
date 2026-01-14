import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getTaskActivity } from "../controllers/activity.controller.js";

const router = Router();

router.get("/tasks/:id/activity", requireAuth, getTaskActivity);

export default router;
