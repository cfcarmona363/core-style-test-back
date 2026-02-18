import "dotenv/config";
import { sendEmail } from "./mail";
import { saveRow } from "./saveData";
import type {
  SendEmailBody,
  SendEmailSuccessResponse,
  SendEmailErrorResponse,
  FormData,
  HealthResponse,
} from "./types";

const ALLOWED_ORIGINS = [
  "https://core-style-test-front.vercel.app",
  "http://localhost:3000",
];

function setCorsHeaders(
  res: any,
  origin: string | undefined,
): Record<string, string> {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin || "") ? origin : "*";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return {};
}

function parseBody(body: any): any {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (_) {
      return {};
    }
  }
  return body || {};
}

export default async function handler(req: any, res: any): Promise<void> {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (
    req.method === "GET" &&
    (req.url === "/health" || req.url === "/api/health")
  ) {
    res.status(200).json({ ok: true } as HealthResponse);
    return;
  }

  if (
    req.method === "POST" &&
    (req.url === "/send-email" || req.url === "/api/send-email")
  ) {
    try {
      const body = parseBody(req.body);
      console.log(
        "[send-email] Request body keys:",
        Object.keys(body ?? {}),
        "has formData:",
        "formData" in (body ?? {}),
      );

      const { to, subject, html, text, replyTo } = body as SendEmailBody;

      if (!to || typeof to !== "string") {
        res.status(400).json({
          error: 'Missing or invalid "to" (recipient email)',
        } as SendEmailErrorResponse);
        return;
      }
      if (html === undefined || html === null) {
        res.status(400).json({
          error: 'Missing "html" (email body as string)',
        } as SendEmailErrorResponse);
        return;
      }

      const result = await sendEmail({
        to: to.trim(),
        subject: subject != null ? String(subject) : "No subject",
        html: String(html),
        text: text != null ? String(text) : undefined,
        replyTo: replyTo != null ? String(replyTo).trim() : undefined,
      });

      const formData = body.formData as FormData | undefined;
      if (formData != null && typeof formData === "object") {
        try {
          await saveRow(formData);
        } catch (saveErr) {
          const saveMessage =
            saveErr instanceof Error ? saveErr.message : "Unknown error";
          console.error("Save to Notion after email:", saveMessage);
          res.status(500).json({
            error: `Email was sent but saving to Notion failed: ${saveMessage}`,
          } as SendEmailErrorResponse);
          return;
        }
      }

      const successResponse: SendEmailSuccessResponse = {
        success: true,
        messageId: "1234567890",
      };
      res.status(200).json(successResponse);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send email";
      console.error("Send email error:", message);
      if (
        message.includes("GMAIL_USER") ||
        message.includes("GMAIL_APP_PASSWORD")
      ) {
        res.status(500).json({
          error:
            "Server mail configuration error. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
        } as SendEmailErrorResponse);
        return;
      }
      res.status(500).json({ error: message } as SendEmailErrorResponse);
    }
    return;
  }

  res.status(404).json({ error: "Not found" });
}
