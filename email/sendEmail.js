import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

const {
  SENDGRID_API_KEY,
  FROM_EMAIL: fromEmail,
  APP_NAME: appName = "MyApp",
  TEMPLATE_WELCOME: templateWelcome,
} = process.env;

if (!SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY environment variable");
}
if (!fromEmail) {
  throw new Error("Missing FROM_EMAIL environment variable");
}


sgMail.setApiKey(SENDGRID_API_KEY);


export async function sendEmail({ to, name }) {
  const msg = {
    to,
    from: fromEmail,
    templateId: templateWelcome,
    dynamic_template_data: {
      name,
      appName: appName,
      supportEmail:fromEmail,
      year: new Date().getFullYear(),
    },
  };

  try {
    const response = await sgMail.send(msg);
    console.info("Email sent:", response?.[0]?.statusCode ?? "Unknown status");
    return response?.[0] ?? response;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error?.response.body) {
            console.error("SendGrid response body:", JSON.stringify(error.response.body));

    }
    throw error;
  }
}
