import { Resend } from "resend";

let resend: Resend | null = null;

const getResend = (apiKey?: string) => {
  if (apiKey) {
    return new Resend(apiKey);
  }
  
  if (!resend && typeof process !== "undefined" && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

export const sendEmail = async (options: SendEmailOptions, apiKey?: string, from?: string) => {
  const resendClient = getResend(apiKey);

  if (!resendClient) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
    console.log(`[MOCK EMAIL to ${options.to}]: ${options.subject}`);
    return { id: "mock-id" };
  }

  const pEnv = typeof process !== "undefined" ? process.env : {};
  const fromEmail = from || pEnv.EMAIL_FROM || "Impact Circle <onboarding@resend.dev>";

  try {
    const data = await resendClient.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
