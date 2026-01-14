import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "UPDATED",
        "STATUS_CHANGED",
        "ASSIGNED",
      ],
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

export const Activity = mongoose.model("Activity", activitySchema);
