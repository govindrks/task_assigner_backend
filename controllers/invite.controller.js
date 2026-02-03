import crypto from "crypto";
import { Invite } from "../models/invite.model.js";
import { Membership } from "../models/Membership.model.js";
import { Organization } from "../models/organization.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { sendInviteEmail } from "../services/inviteEmail.service.js";

/* =====================================================
   INVITE USER
===================================================== */
export const inviteUser = async (req, res) => {
  try {
    let { email, organizationId } = req.body;

    email = email.toLowerCase().trim();

    /* ---------- check admin ---------- */
    const isAdmin = await Membership.findOne({
      user: req.user.id,
      organization: organizationId,
      role: "ORG_ADMIN",
    });

    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    /* ---------- reuse invite if exists ---------- */
    let invite = await Invite.findOne({
      email,
      organization: organizationId,
      accepted: false,
    });

    const token = crypto.randomBytes(32).toString("hex");

    if (invite) {
      invite.token = token;
      invite.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await invite.save();
    } else {
      invite = await Invite.create({
        email,
        organization: organizationId,
        invitedBy: req.user.id,
        token,
      });
    }

    /* =====================================================
       🔔 CREATE IN-APP NOTIFICATION (ONLY IF USER EXISTS)
    ===================================================== */
    const invitedUser = await User.findOne({ email });

    if (invitedUser) {
      await Notification.create({
        user: invitedUser._id,
        organization: organizationId,
        type: "ORG_INVITE",
        message: `You’ve been invited to join ${org.name}`,
        metadata: {
          inviteId: invite._id,
          token,
        },
      });
    }

    /* ---------- send email (async) ---------- */
    sendInviteEmail({
      email,
      name: email.split("@")[0],
      token,
      orgName: org.name,
    }).catch((err) =>
      console.error("Invite email failed:", err.message)
    );

    return res.json({
      success: true,
      message: "Invite sent successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   ACCEPT INVITE
===================================================== */
export const acceptInvite = async (req, res) => {
  try {
    const token = req.params.token;

    const invite = await Invite.findOne({ token });

    if (!invite) {
      return res.status(400).json({ message: "Invalid invite" });
    }

    if (invite.accepted) {
      return res.status(400).json({ message: "Invite already used" });
    }

    if (invite.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invite expired" });
    }

    /* ---------- add membership ---------- */
    const exists = await Membership.findOne({
      user: req.user.id,
      organization: invite.organization,
    });

    if (!exists) {
      await Membership.create({
        user: req.user.id,
        organization: invite.organization,
        role: "ORG_MEMBER",
      });
    }

    invite.accepted = true;
    invite.acceptedAt = new Date();
    await invite.save();

    /* =====================================================
       🔔 MARK INVITE NOTIFICATION AS READ
    ===================================================== */
    await Notification.updateMany(
      {
        user: req.user.id,
        "metadata.token": token,
      },
      { isRead: true }
    );

    /* OPTIONAL: create joined notification */
    await Notification.create({
      user: req.user.id,
      organization: invite.organization,
      type: "ORG_INVITE_ACCEPTED",
      message: "You joined the organization successfully",
      isRead: false,
    });

    res.json({
      success: true,
      message: "Joined organization",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
