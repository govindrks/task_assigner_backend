import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { logActivity } from "../utils/logActivity.js";

/* ================= CREATE TASK (USER) ================= */
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      assignedTo: req.user.id, // assign to self
      status: "TODO",
      priority: priority || "MEDIUM",
    });

    await logActivity({
      taskId: task._id,
      action: "CREATED",
      message: "Task created",
      userId: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET MY TASKS (USER) ================= */

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({
      assignedTo: userId,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  let tasks;

  if (req.user.role === "ADMIN") {
    tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("updatedBy", "name email")
      .populate("createdBy", "name email role");
  } else {
    tasks = await Task.find({
      assignedTo: req.user.id,
    })
      .populate("assignedTo", "name email")
      .populate("updatedBy", "name email")
      .populate("createdBy", "name email");
  }

  res.json(tasks);
};

/* ================= GET SINGLE TASK (USER) ================= */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TASK (USER) ================= */
export const updateTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    const oldPriority = task.priority;
    const newPriority = req.body.priority;

    if (oldPriority !== newPriority) {
      task.priority = newPriority;
      task.updatedBy = req.user.id;
      await task.save();

      await notifyUser({
        userId: task.assignedTo,
        taskId: task._id,
        type: "TASK_UPDATED",
        message: `Priority updated for task "${task.title}"`,
        changes: [
          {
            field: "priority",
            oldValue: oldPriority,
            newValue: newPriority,
          },
        ],
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= MARK DONE (USER) ================= */
export const markDone = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = "DONE";
    task.updatedBy = req.user.id;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE TASK (USER) ================= */
export const deleteTaskById = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
