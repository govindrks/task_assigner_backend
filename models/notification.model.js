import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* OPTIONAL now (task OR invite) */
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: false,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_UPDATED",
        "ORG_INVITE",
        "ORG_INVITE_ACCEPTED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Optional metadata for additional context
    metadata: {
      inviteId: mongoose.Schema.Types.ObjectId,
      token: String,
    },

    changes: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ organization: 1, user: 1, isRead: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
