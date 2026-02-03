import { Task } from "../models/task.model.js";
import { Organization } from "../models/organization.model.js";
import { Membership } from "../models/Membership.model.js";

/* CREATE (ADMIN ONLY) */
export const createTask = async (req, res) => {
  const orgId = req.user.organizationId;

  if (!orgId) {
    return res.status(400).json({ message: "No organization selected" });
  }

  // Tenant is derived from JWT. If a client sends organizationId in body, it must match the selected tenant.
  if (
    req.body.organizationId &&
    req.body.organizationId.toString() !== orgId?.toString()
  ) {
    return res.status(400).json({
      message:
        "organizationId does not match selected organization (select tenant and retry)",
    });
  }

  // `requireAdmin` already verified creator/admin for req.user.organizationId.
  const task = await Task.create({
    ...req.body,
    organization: orgId,
    createdBy: req.user.id,
  });

  res.status(201).json(task);
};

/* GET */
export const getTasks = async (req, res) => {
  // Tenant is derived from JWT. If a client sends organizationId as query, it must match the selected tenant.
  if (
    req.query.organizationId &&
    req.query.organizationId.toString() !== req.user.organizationId?.toString()
  ) {
    return res.status(400).json({
      message:
        "organizationId does not match selected organization (select tenant and retry)",
    });
  }

  const tasks = await Task.find({
    organization: req.user.organizationId,
  })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("assignedTo", "name email");

  res.json(tasks);
};

// GET MY TASKS
export const getMyTasks = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organizationId,
    })
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

/* UPDATE */
export const updateTaskById = async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    organization: req.user.organizationId,
  });

  if (!task) return res.status(404).json({ message: "Not found" });

  const org = await Organization.findById(req.user.organizationId);

  const isAdmin = org.createdBy.toString() === req.user.id;

  const allowed = isAdmin
    ? ["title", "description", "assignedTo", "dueDate", "status", "priority"]
    : ["status", "priority"];

  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  Object.assign(task, updates);
  task.updatedBy = req.user.id;

  await task.save();

  res.json(task);
};

/* DELETE */
export const deleteTaskById = async (req, res) => {
  const org = await Organization.findById(req.user.organizationId);

  if (org.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Admin only" });
  }

  await Task.findOneAndDelete({
    _id: req.params.id,
    organization: req.user.organizationId,
  });

  res.json({ message: "Deleted" });
};
