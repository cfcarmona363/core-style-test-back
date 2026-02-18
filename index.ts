import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { sendEmail } from "./mail";
import { saveRow } from "./saveData";
import type {
  SendEmailBody,
  SendEmailSuccessResponse,
  SendEmailErrorResponse,
  FormData,
  HealthResponse,
} from "./types";

const app = express();

const ALLOWED_ORIGINS = [
  "https://core-style-test-front.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

/**
 * POST /send-email
 *
 * Body (JSON): to, subject?, html, text?, replyTo?, formData?
 * If formData is present, it is saved to Notion after the email is sent successfully.
 * Email is sent via Gmail and appears as sent from GMAIL_USER.
 */
app.post(
  "/api/send-email",
  async (
    req: Request<
      object,
      SendEmailSuccessResponse | SendEmailErrorResponse,
      SendEmailBody
    >,
    res: Response<SendEmailSuccessResponse | SendEmailErrorResponse>,
  ): Promise<void> => {
    try {
      console.log(
        "[send-email] Request body keys:",
        Object.keys(req.body ?? {}),
        "has formData:",
        "formData" in (req.body ?? {}),
      );
      const { to, subject, html, text, replyTo } = req.body;

      if (!to || typeof to !== "string") {
        res
          .status(400)
          .json({ error: 'Missing or invalid "to" (recipient email)' });
        return;
      }
      if (html === undefined || html === null) {
        res
          .status(400)
          .json({ error: 'Missing "html" (email body as string)' });
        return;
      }

      const result = await sendEmail({
        to: to.trim(),
        subject: subject != null ? String(subject) : "No subject",
        html: String(html),
        text: text != null ? String(text) : undefined,
        replyTo: replyTo != null ? String(replyTo).trim() : undefined,
      });

      const formData = req.body.formData as FormData | undefined;
      if (formData != null && typeof formData === "object") {
        try {
          await saveRow(formData);
        } catch (saveErr) {
          const saveMessage =
            saveErr instanceof Error ? saveErr.message : "Unknown error";
          console.error("Save to Notion after email:", saveMessage);
          res.status(500).json({
            error: `Email was sent but saving to Notion failed: ${saveMessage}`,
          });
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
        });
        return;
      }
      res.status(500).json({ error: message });
    }
  },
);

app.get("/health", (_req: Request, res: Response<HealthResponse>): void => {
  res.json({ ok: true });
});

// Local development server
if (process.env.NODE_ENV !== "production" && require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Mail service listening on port ${PORT}`);
  });
}

module.exports = app;
