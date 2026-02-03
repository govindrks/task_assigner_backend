import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    dueDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

taskSchema.index({ organization: 1, status: 1 });
taskSchema.index({ organization: 1, assignedTo: 1 });

export const Task = mongoose.model("Task", taskSchema);
