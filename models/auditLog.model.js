import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  taskId: mongoose.Schema.Types.ObjectId,
  action: String,
  oldValue: Object,
  newValue: Object,
  performedBy: mongoose.Schema.Types.ObjectId,
  performedByRole: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditLogSchema);
