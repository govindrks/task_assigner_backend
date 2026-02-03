import { Activity } from "../models/activity.model.js";

/* =====================================================
   Tenant aware activity log
===================================================== */
export const logActivity = async ({
  organization,
  taskId,
  action,
  message,
  userId,
}) => {
  await Activity.create({
    organization,
    taskId,
    action,
    message,
    performedBy: userId,
  });
};
