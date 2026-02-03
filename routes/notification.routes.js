import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireMember } from "../middleware/org.middleware.js";
import {
  getMyNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/notifications/my", requireAuth, requireMember, getMyNotifications);

router.patch("/notifications/:id/read", requireAuth, requireMember, markOneAsRead);

router.patch("/notifications/read-all", requireAuth, requireMember, markAllAsRead);

export default router;
