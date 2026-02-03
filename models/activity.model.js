import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["CREATED", "UPDATED", "STATUS_CHANGED", "ASSIGNED", "COMMENT"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ organization: 1, taskId: 1 });

export const Activity = mongoose.model("Activity", activitySchema);
