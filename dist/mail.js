"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.createTransporter = createTransporter;
const nodemailer_1 = __importDefault(require("nodemailer"));
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
function createTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment. See .env.example.");
    }
    return nodemailer_1.default.createTransport({
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
async function sendEmail(options) {
    const { to, subject = "No subject", html, text, replyTo, } = options;
    const transporter = createTransporter();
    const from = process.env.GMAIL_USER;
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
//# sourceMappingURL=mail.js.map