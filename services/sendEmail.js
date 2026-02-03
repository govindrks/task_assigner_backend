import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const {
  SENDGRID_API_KEY,
  FROM_EMAIL: fromEmail,
  APP_NAME: appName = "MyApp",
} = process.env;

/* ================= SETUP ================= */

if (!SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY environment variable");
}

if (!fromEmail) {
  throw new Error("Missing FROM_EMAIL environment variable");
}

sgMail.setApiKey(SENDGRID_API_KEY);

/* ================= GENERIC SENDER ================= */

export async function sendEmail({
  to,
  templateId,
  dynamicData = {},
}) {
  const msg = {
    to,
    from: fromEmail,
    templateId,
    dynamic_template_data: {
      appName,
      supportEmail: fromEmail,
      year: new Date().getFullYear(),
      ...dynamicData,
    },
  };

  try {
    const [response] = await sgMail.send(msg);

    console.info("Email sent:", response.statusCode);

    return response;
  } catch (error) {
    console.error("SendGrid error:", error?.response?.body || error.message);
    throw error;
  }
}
