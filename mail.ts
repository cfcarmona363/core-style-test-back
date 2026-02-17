import nodemailer, { type Transporter } from "nodemailer";
import type { SendEmailBody } from "./types";

/**
 * Creates a Nodemailer transporter configured for Gmail.
 * Emails are sent through Gmail's SMTP and appear as sent from your Gmail account.
 *
 * Requires in .env:
 *   GMAIL_USER     - Full Gmail address (e.g. you@gmail.com)
 *   GMAIL_APP_PASSWORD - App Password from Google (not your normal password)
 *
 * To get an App Password:
 *   1. Enable 2-Step Verification on your Google account
 *   2. Go to Google Account → Security → App passwords
 *   3. Generate a new app password for "Mail"
 */
function createTransporter(): Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment. See .env.example."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send an email with HTML (and optional plain-text fallback).
 */
export async function sendEmail(
  options: SendEmailBody & { subject?: string }
): Promise<{ messageId: string }> {
  const {
    to,
    subject = "No subject",
    html,
    text,
    replyTo,
  } = options;

  const transporter = createTransporter();
  const from = process.env.GMAIL_USER as string;

  const mailOptions = {
    from: `"${process.env.GMAIL_FROM_NAME || "Mail Service"}" <${from}>`,
    to,
    subject,
    html,
    ...(text && { text }),
    ...(replyTo && { replyTo }),
  };

  const result = await transporter.sendMail(mailOptions);
  return { messageId: result.messageId };
}

export { createTransporter };
