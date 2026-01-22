import { Notification } from "../models/notification.model.js";

export const notifyUser = async ({ userId, taskId, type, message, changes = [] }) => {
  await Notification.create({
    user: userId,
    task: taskId,
    type,
    message,
    changes,
  });
};
