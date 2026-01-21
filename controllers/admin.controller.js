import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { logActivity } from "../utils/logActivity.js";

/* ================= CREATE TASK (ADMIN) ================= */
export const adminCreateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status, priority } = req.body;

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
      priority: priority || "MEDIUM", // ✅ FIXED
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      createdBy: req.user.id,
      updatedBy: null,
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
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TASK (ADMIN FULL UPDATE) ================= */
export const adminUpdateTaskById = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "assignedTo",
      "dueDate",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    updates.updatedBy = req.user.id;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("assignedTo", "name email");

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await logActivity({
      taskId: updatedTask._id,
      action: "UPDATED",
      message: "Task updated by admin",
      userId: req.user.id,
    });

    res.json(updatedTask);
  } catch (err) {
    console.error("Admin update error:", err);
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
      { new: true }
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
