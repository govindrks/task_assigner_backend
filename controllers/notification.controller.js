import { Notification } from "../models/notification.model.js";


export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .populate("task", "title")
    .sort({ createdAt: -1 });

  res.json(notifications);
};


export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ message: "All notifications marked as read" });
};
