import { Task } from "../models/task.model.js";
import { logActivity } from "../utils/logActivity.js";

/* ADMIN CREATE */
export const adminCreateTask = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    organization: req.user.organizationId,
    createdBy: req.user.id,
  });

  await logActivity({
    organization: req.user.organizationId,
    taskId: task._id,
    action: "CREATED",
    message: "Task created",
    userId: req.user.id,
  });

  res.status(201).json(task);
};

/* ADMIN GET ALL */
export const getAllTasks = async (req, res) => {
  // "Admin tasks" = tasks created by the org creator/admin and assigned to other members
  const tasks = await Task.find({
    organization: req.user.organizationId,
    createdBy: req.user.id,
    assignedTo: { $nin: [null, req.user.id] },
  })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("assignedTo", "name email");

  res.json(tasks);
};

/* ADMIN DELETE */
export const deleteTask = async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.id,
    organization: req.user.organizationId,
  });

  res.json({ message: "Deleted" });
};
