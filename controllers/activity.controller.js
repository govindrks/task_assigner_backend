import { Activity } from "../models/activity.model.js";
import { Task } from "../models/task.model.js";

export const getTaskActivity = async (req, res) => {
  const activities = await Activity.find({
    taskId: req.params.id,
    organization: req.user.organizationId,
  })
    .populate("performedBy", "name email")
    .sort({ createdAt: -1 });

  res.json(activities);
};

/* =====================================================
   COMMENTS (stored as Activity entries)
===================================================== */
export const getTaskComments = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "No organization selected" });
    }

    const comments = await Activity.find({
      taskId: req.params.id,
      organization: orgId,
      action: "COMMENT",
    })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTaskComment = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: "No organization selected" });
    }

    const message = (req.body.message || req.body.comment || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organization: orgId,
    }).select("_id");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await Activity.create({
      organization: orgId,
      taskId: task._id,
      action: "COMMENT",
      message,
      performedBy: req.user.id,
    });

    await comment.populate("performedBy", "name email");

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
