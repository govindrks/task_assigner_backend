import AuditLog from "../models/AuditLog.js";

export const logAudit = async (
  taskId,
  action,
  oldValue,
  newValue,
  user
) => {
  await AuditLog.create({
    taskId,
    action,
    oldValue,
    newValue,
    performedBy: user.id,
    performedByRole: user.role,
  });
};
