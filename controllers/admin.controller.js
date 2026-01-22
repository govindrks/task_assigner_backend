import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { logActivity } from "../utils/logActivity.js";
import { notifyUser } from "../utils/notifyUser.js";

/* ================= CREATE TASK (ADMIN) ================= */
export const adminCreateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status, priority } =
      req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        message: "Title and assigned user are required",
      });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      createdBy: req.user.id,
      updatedBy: null,
    });

    await notifyUser({
  userId: assignedTo,
  taskId: task._id,
  type: "TASK_ASSIGNED",
  message: `You have been assigned a new task: ${task.title}`,
  changes: [
    { field: "status", oldValue: null, newValue: task.status },
    { field: "priority", oldValue: null, newValue: task.priority },
    { field: "dueDate", oldValue: null, newValue: task.dueDate || "N/A" },
  ],
});

    await logActivity({
      taskId: task._id,
      action: "CREATED",
      message: `Task created and assigned`,
      userId: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Admin create error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL TASKS ================= */
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name role")
      .populate("updatedBy", "name email")
      //This sorts tasks by creation time in descending order
      //The most recently created tasks appear first.
      .sort({ createdAt: -1 });

    // Returns the fully enriched and sorted list of tasks to the frontend.
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TASK (ADMIN FULL UPDATE) ================= */
export const adminUpdateTaskById = async (req, res) => {
  try {
    const updates = req.body;

    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const changes = [];

    Object.keys(updates).forEach((field) => {
      if (
        existingTask[field] !== undefined &&
        existingTask[field]?.toString() !== updates[field]?.toString()
      ) {
        changes.push({
          field,
          oldValue: existingTask[field],
          newValue: updates[field],
        });
      }
    });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedBy: req.user.id },
      { new: true }
    );

    await notifyUser({
      userId: updatedTask.assignedTo,
      taskId: updatedTask._id,
      type: "TASK_UPDATED",
      message: `Task "${updatedTask.title}" was updated`,
      changes,
    });

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE STATUS (ADMIN QUICK STATUS UPDATE) ================= */
const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user.id },
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await logActivity({
      taskId: task._id,
      action: "STATUS_CHANGED",
      message: `Status changed to ${status}`,
      userId: req.user.id,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE TASK ================= */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await logActivity({
      taskId: task._id,
      action: "DELETED",
      message: "Task deleted by admin",
      userId: req.user.id,
    });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
