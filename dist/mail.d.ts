import { type Transporter } from "nodemailer";
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
declare function createTransporter(): Transporter;
/**
 * Send an email with HTML (and optional plain-text fallback).
 */
export declare function sendEmail(options: SendEmailBody & {
    subject?: string;
}): Promise<{
    messageId: string;
}>;
export { createTransporter };
//# sourceMappingURL=mail.d.ts.map