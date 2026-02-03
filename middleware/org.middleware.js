import { Membership } from "../models/Membership.model.js";
import { Organization } from "../models/organization.model.js";

/* =====================================================
   REQUIRE MEMBER
   - personal mode allowed
   - org mode requires membership
===================================================== */
export const requireMember = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;

    /* ===============================
       PERSONAL MODE (no org selected)
       → allow
    =============================== */
    if (!orgId) {
      return next();
    }

    /* ===============================
       ORG MODE → must be member
    =============================== */
    const exists = await Membership.exists({
      user: req.user.id,
      organization: orgId,
    });

    if (!exists) {
      return res.status(403).json({
        message: "Not a member of this organization and not authorized",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   REQUIRE ADMIN
   - must have org
   - must be creator/admin
===================================================== */
export const requireAdmin = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;

    /* ===============================
       PERSONAL MODE → invalid
    =============================== */
    if (!orgId) {
      return res.status(400).json({
        message: "No organization selected",
      });
    }

    const admin = await Organization.exists({
      _id: orgId,
      createdBy: req.user.id,
    });

    if (!admin) {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
