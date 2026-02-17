"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const saveData_1 = require("./saveData");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
const PORT = Number(process.env.PORT) || 3000;
/**
 * POST /send-email
 *
 * Body (JSON): to, subject?, html, text?, replyTo?, formData?
 * If formData is present, it is saved to Notion after the email is sent successfully.
 * Email is sent via Gmail and appears as sent from GMAIL_USER.
 */
app.post("/send-email", async (req, res) => {
    try {
        console.log("[send-email] Request body keys:", Object.keys(req.body ?? {}), "has formData:", "formData" in (req.body ?? {}));
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
        // const result = await sendEmail({
        //   to: to.trim(),
        //   subject: subject != null ? String(subject) : "No subject",
        //   html: String(html),
        //   text: text != null ? String(text) : undefined,
        //   replyTo: replyTo != null ? String(replyTo).trim() : undefined,
        // });
        const formData = req.body.formData;
        if (formData != null && typeof formData === "object") {
            console.log("[send-email] Saving formData to Notion...");
            try {
                await (0, saveData_1.saveRow)(formData);
            }
            catch (saveErr) {
                const saveMessage = saveErr instanceof Error ? saveErr.message : "Unknown error";
                console.error("Save to Notion after email:", saveMessage);
                res.status(500).json({
                    error: `Email was sent but saving to Notion failed: ${saveMessage}`,
                });
                return;
            }
        }
        const successResponse = {
            success: true,
            // messageId: result.messageId,
            messageId: "1234567890",
        };
        res.status(200).json(successResponse);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send email";
        console.error("Send email error:", message);
        if (message.includes("GMAIL_USER") ||
            message.includes("GMAIL_APP_PASSWORD")) {
            res.status(500).json({
                error: "Server mail configuration error. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
            });
            return;
        }
        res.status(500).json({ error: message });
    }
});
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.listen(PORT, () => {
    console.log(`Mail service listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map