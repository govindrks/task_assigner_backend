import { Activity } from "../models/activity.model.js";

export const getTaskActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      taskId: req.params.id,
    })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
