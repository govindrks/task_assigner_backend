import mongoose from "mongoose";

// const organizationSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },

//   description: String,

//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },

//   members: [
//     {
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//       },
//       role: {
//         type: String,
//         enum: ["ORG_ADMIN", "ORG_MEMBER"],
//         required: true,
//       },
//     },
//   ],

//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// }, { timestamps: true });

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Organization = mongoose.model("Organization", organizationSchema);
