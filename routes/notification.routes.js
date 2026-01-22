import { Router } from "express";
import { getMyNotifications, markAllAsRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();    

router.get("/notifications/my", requireAuth, getMyNotifications);
router.patch("/notifications/read-all", requireAuth, markAllAsRead);



export default router;