import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  inviteUser,
  acceptInvite,
} from "../controllers/invite.controller.js";

const router = Router();

/* create invite */
router.post("/", requireAuth, inviteUser);

/* accept */
router.post("/:token/accept", requireAuth, acceptInvite);

export default router;
