import { Activity } from "../models/activity.model.js";

export const logActivity = async ({
  taskId,
  action,
  message,
  userId,
}) => {
  await Activity.create({
    taskId,
    action,
    message,
    performedBy: userId,
  });
};
