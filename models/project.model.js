import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      minlength: 2,
      maxlength: 10,
    },

    description: {
      type: String,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["ADMIN", "MEMBER"],
          default: "MEMBER",
        },
      },
    ],

    isArchived: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

projectSchema.index({ organization: 1, key: 1 }, { unique: true });

export const Project = mongoose.model("Project", projectSchema);
