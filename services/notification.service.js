import Notification from "../models/Notification.js";


export const notifyUser = async ({ userId, title, message }) => {
  try {
    // Save notification in DB
    await Notification.create({
      user: userId,
      title,
      message,
      isRead: false,
    });

    // Optional: also send email or push
    // const user = await User.findById(userId);
    // await sendEmail({ to: user.email, subject: title, text: message });

  } catch (err) {
    console.error("Notification failed:", err.message);
  }
};
