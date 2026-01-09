import { Task } from "../models/task.model";

//Admin create task to the users
export const adminCreateTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { title, assignedTo, description, dueDate } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({ message: "Title and assignedTo required" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAllTasks = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name role");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin change task status
const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const old = { status: task.status };
    task.status = status;
    await task.save();

    await logAudit(task._id, "STATUS_CHANGED", old, task, req.user);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Admin delete any task
export const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    await logAudit(task._id, "DELETED", task, null, req.user);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

