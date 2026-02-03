import { sendEmail } from "./sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

export const sendInviteEmail = ({ email, name, token, orgName }) => {
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite/${token}`;

  return sendEmail({
    to: email,
    templateId: process.env.TEMPLATE_INVITE,
    dynamicData: { name, orgName, inviteLink },
  });
};
