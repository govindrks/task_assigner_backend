import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireMember } from "../middleware/org.middleware.js";
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationMembers,
} from "../controllers/organization.controller.js";

const router = Router();

/* create */
router.post("/organizations", requireAuth, createOrganization);

/* my orgs */
router.get("/organizations/my", requireAuth, getMyOrganizations);

/* members */
router.get("/organizations/:id/members", requireAuth, requireMember, getOrganizationMembers);

/* remove */
// router.delete(
//   "/organizations/members/:userId",
//   requireAuth,
//   requireAdmin,
//   removeMember
// );

export default router;
