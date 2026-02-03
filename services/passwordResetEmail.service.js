import { sendEmail } from "./sendEmail.js";

export const sendPasswordResetEmail = ({ email, name, token }) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  return sendEmail({
    to: email,
    templateId: process.env.TEMPLATE_PASSWORD_RESET,
    dynamicData: {
      name,
      resetLink,
      expiryHours: 2,
    },
  });
};
