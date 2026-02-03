import { Organization } from "../models/organization.model.js";
import { Membership } from "../models/Membership.model.js";



/* =====================================================
   CREATE
===================================================== */
export const createOrganization = async (req, res) => {
  try {
    const org = await Organization.create({
      name: req.body.name,
      createdBy: req.user.id,
    });

    await Membership.create({
      user: req.user.id,
      organization: org._id,
      role: "ORG_ADMIN",
    });

    res.json(org);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* =====================================================
   MY ORGS (optimized)
===================================================== */
export const getMyOrganizations = async (req, res) => {
  try {
    const memberships = await Membership.find({
      user: req.user.id,
    }).populate("organization");

    const orgIds = memberships.map((m) => m.organization._id);

    const counts = await Membership.aggregate([
      { $match: { organization: { $in: orgIds } } },
      { $group: { _id: "$organization", count: { $sum: 1 } } },
    ]);

    const map = {};
    counts.forEach((c) => (map[c._id.toString()] = c.count));

    const orgs = memberships.map((m) => ({
      ...m.organization.toObject(),
      memberCount: map[m.organization._id.toString()] || 0,
    }));

    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* =====================================================
   MEMBERS
===================================================== */
export const getOrganizationMembers = async (req, res) => {
  try {
    const exists = await Membership.exists({
      user: req.user.id,
      organization: req.params.id,
    });

    if (!exists) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const members = await Membership.find({
      organization: req.params.id,
    }).populate("user", "name email");

    res.json(
      members.map((m) => ({
        _id: m.user._id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
