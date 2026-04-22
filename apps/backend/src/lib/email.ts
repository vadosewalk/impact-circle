import { Resend } from "resend";

let resend: Resend | null = null;

const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

export const sendEmail = async (options: SendEmailOptions) => {
  const resendClient = getResend();

  if (!resendClient) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
    console.log(`[MOCK EMAIL to ${options.to}]: ${options.subject}`);
    return { id: "mock-id" };
  }

  try {
    const data = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || "Impact Circle <onboarding@resend.dev>",
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
