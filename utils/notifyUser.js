import { Notification } from "../models/notification.model.js";

/* =====================================================
   Tenant aware notifications
===================================================== */
export const notifyUser = async ({
  organization,
  userId,
  taskId,
  type,
  message,
  changes = [],
}) => {
  await Notification.create({
    organization,
    user: userId,
    task: taskId,
    type,
    message,
    changes,
  });
};
