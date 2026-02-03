import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
  { timestamps: true },
);

// Create a compound index to allow multiple invites to same email for different orgs
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Ensure unique invites per email per organization
inviteSchema.index({ email: 1, organization: 1 }, { unique: true });

export const Invite = mongoose.model("Invite", inviteSchema);
