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

function sendJson(res: any, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function parseBody(req: any) {
  if (req.body == null) return undefined;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return undefined;
    }
  }
  return req.body;
}

export default async function handler(req: any, res: any): Promise<void> {
  const url = (req.url || "").split("?")[0];

  function setCorsHeaders(resLocal: any, reqLocal: any) {
    const origin = process.env.CORS_ORIGIN || "*";
    resLocal.setHeader("Access-Control-Allow-Origin", origin);
    resLocal.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    );
    const reqHeaders =
      reqLocal?.headers?.["access-control-request-headers"] ||
      reqLocal?.headers?.["Access-Control-Request-Headers"] ||
      "Content-Type,Authorization";
    resLocal.setHeader("Access-Control-Allow-Headers", reqHeaders);
    resLocal.setHeader("Access-Control-Allow-Credentials", "true");
  }

  setCorsHeaders(res, req);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET" && (url === "/health" || url === "/")) {
    sendJson(res, 200, { ok: true } as HealthResponse);
    return;
  }

  if (
    req.method === "POST" &&
    (url === "/send-email" || url === "/api/send-email")
  ) {
    try {
      const body = parseBody(req) ?? {};
      console.log(
        "[send-email] Request body keys:",
        Object.keys(body ?? {}),
        "has formData:",
        "formData" in (body ?? {}),
      );

      const { to, subject, html, text, replyTo } = body as SendEmailBody;

      if (!to || typeof to !== "string") {
        sendJson(res, 400, {
          error: 'Missing or invalid "to" (recipient email)',
        } as SendEmailErrorResponse);
        return;
      }
      if (html === undefined || html === null) {
        sendJson(res, 400, {
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

      const formData = (body as any).formData as FormData | undefined;
      if (formData != null && typeof formData === "object") {
        try {
          await saveRow(formData);
        } catch (saveErr) {
          const saveMessage =
            saveErr instanceof Error ? saveErr.message : "Unknown error";
          console.error("Save to Notion after email:", saveMessage);
          sendJson(res, 500, {
            error: `Email was sent but saving to Notion failed: ${saveMessage}`,
          } as SendEmailErrorResponse);
          return;
        }
      }

      const successResponse: SendEmailSuccessResponse = {
        success: true,
        messageId: "1234567890",
      };
      sendJson(res, 200, successResponse);
      return;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send email";
      console.error("Send email error:", message);
      if (
        message.includes("GMAIL_USER") ||
        message.includes("GMAIL_APP_PASSWORD")
      ) {
        sendJson(res, 500, {
          error:
            "Server mail configuration error. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
        } as SendEmailErrorResponse);
        return;
      }
      sendJson(res, 500, { error: message } as SendEmailErrorResponse);
      return;
    }
  }

  sendJson(res, 404, { error: "Not found" });
}
