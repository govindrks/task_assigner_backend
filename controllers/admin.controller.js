import { Task } from "../models/task.model.js";
import mongoose from "mongoose";

/* ================= CREATE TASK ================= */
export const adminCreateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status } = req.body;

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
      assignedTo: new mongoose.Types.ObjectId(assignedTo), // 🔥 FIX
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
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


export const adminUpdateTaskById = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id,
      },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE STATUS ================= */
const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

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

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
