import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireMember } from "../middleware/org.middleware.js";
import {
  addTaskComment,
  getTaskActivity,
  getTaskComments,
} from "../controllers/activity.controller.js";

const router = Router();

router.get(
  "/tasks/:id/activity",
  requireAuth,
  requireMember,
  getTaskActivity
);

router.get("/tasks/:id/comments", requireAuth, requireMember, getTaskComments);
router.post("/tasks/:id/comments", requireAuth, requireMember, addTaskComment);

export default router;
