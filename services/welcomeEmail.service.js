
import { sendEmail } from "./sendEmail.js";
import dotenv from "dotenv";  
dotenv.config();

export const sendWelcomeEmail = ({ email, name, loginLink }) =>
  sendEmail({
    to: email,
    templateId: process.env.TEMPLATE_WELCOME,
    dynamicData: { name, loginLink },
  });
