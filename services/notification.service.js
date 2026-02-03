import { Notification } from "../models/notification.model.js";

/* =====================================================
   Tenant safe notification service
===================================================== */
export const sendNotification = async ({
  organization,
  userId,
  taskId,
  type,
  message,
  changes = [],
}) => {
  try {
    await Notification.create({
      organization,
      user: userId,
      task: taskId,
      type,
      message,
      changes,
    });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
