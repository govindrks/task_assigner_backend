import { Organization } from "../models/organization.model.js";
import { Membership } from "../models/Membership.model.js";

/* =====================================================
   ADMIN = creator only
===================================================== */
export const isOrganizationAdmin = async (userId, organizationId) => {
  return Organization.exists({
    _id: organizationId,
    createdBy: userId,
  });
};

/* =====================================================
   MEMBER
===================================================== */
export const isOrganizationMember = async (userId, organizationId) => {
  const admin = await isOrganizationAdmin(userId, organizationId);
  if (admin) return true;

  return Membership.exists({
    user: userId,
    organization: organizationId,
  });
};

/* =====================================================
   ROLE
===================================================== */
export const getUserRoleInOrganization = async (userId, organizationId) => {
  const admin = await isOrganizationAdmin(userId, organizationId);
  if (admin) return "ADMIN";

  const member = await Membership.exists({
    user: userId,
    organization: organizationId,
  });

  return member ? "MEMBER" : null;
};
