import { Task } from "../models/task.model.js";

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      createdBy: req.user.id,
      assignedTo: null, // IMPORTANT
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// export const getMyTasks = async (req, res) => {
//   const tasks = await Task.find({ assignedTo: req.user.id });
//   res.json(tasks);
// };


// Get all tasks for logged-in user
export const getMyTasks = async (req, res) => {
  try {
    const assignedTo = req.user.id;

    const tasks = await Task.find({ assignedTo });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task by ID (user protected)
export const getTaskById = async (req, res) => {
  try {
    const assignedTo = req.user.id;
    const task = await Task.findOne({ _id: req.params.id, assignedTo });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task by ID (only own tasks)
export const updateTaskById = async (req, res) => {
  try {
    const assignedTo = req.user.id;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const markDone = async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    assignedTo: req.user.id
  });

  if (!task) return res.status(404).json({ message: "Not found" });

  const old = { status: task.status };
  task.status = "DONE";
  await task.save();

  await logAudit(task._id, "STATUS_CHANGED", old, task, req.user);

  res.json(task);
};



//Admin updates task status (IN_PROGRESS / DONE)
export const updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(task);
};

// Admin deletes task
// export const deleteTask = async (req, res) => {
//   await Task.findByIdAndDelete(req.params.id);
//   res.json({ message: "Task deleted" });
// };


// Delete a task by ID (only own tasks)
export const deleteTaskById = async (req, res) => {
  try {
    const userId = req.user.id;

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
