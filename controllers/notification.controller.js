import { Notification } from "../models/notification.model.js";

/* =====================================================
   GET MY NOTIFICATIONS
   (IMPORTANT: user-scoped only)
===================================================== */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   MARK SINGLE AS READ
===================================================== */
export const markOneAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id, // security: only own notification
      },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   MARK ALL AS READ
===================================================== */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.json({ message: "Done" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
