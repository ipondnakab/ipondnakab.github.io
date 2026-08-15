import type { VercelRequest, VercelResponse } from "@vercel/node";

import { clientKey, guardRequest } from "../lib/cors";
import { createRateLimiter } from "../lib/rate-limit";

const LINE_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";

const MAX_NAME_CHARS = 100;
const MAX_EMAIL_CHARS = 200;

// A LINE text message holds up to 5,000 characters, and the whole submission
// travels in one. 2,000 leaves ample headroom for the header lines while still
// accepting a genuinely long enquiry — unlike the WhatsApp template route this
// replaced, which capped out at 700.
const MAX_CONTENT_CHARS = 2_000;

// Far stricter than the chat endpoint: a human sends one message and leaves, so
// anything beyond a few per hour is a bot or a mistake.
//
// Overridable because testing the form naturally means more than three
// submissions — set CONTACT_RATE_LIMIT=100 in .env.local and leave it unset in
// Vercel, so production keeps the strict default. A missing, non-numeric or
// non-positive value falls back to 3 rather than accidentally disabling the
// limit on a typo.
const configuredLimit = Number(process.env.CONTACT_RATE_LIMIT);
const RATE_LIMIT_PER_HOUR =
  Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 3;

const checkRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: RATE_LIMIT_PER_HOUR,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactSubmission {
  name: string;
  email: string;
  content: string;
}

const isNonEmptyString = (value: unknown, maxChars: number): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxChars;

const parseSubmission = (body: unknown): ContactSubmission | null => {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, content } = body as Record<string, unknown>;

  if (!isNonEmptyString(name, MAX_NAME_CHARS)) return null;
  if (!isNonEmptyString(email, MAX_EMAIL_CHARS)) return null;
  if (!isNonEmptyString(content, MAX_CONTENT_CHARS)) return null;
  if (!EMAIL_PATTERN.test(email.trim())) return null;

  return {
    name: name.trim(),
    email: email.trim(),
    content: content.trim(),
  };
};

// A value in the honeypot field means a bot filled in every input it found. The
// form renders it hidden, so a real visitor never touches it.
const isBot = (body: unknown): boolean => {
  if (typeof body !== "object" || body === null) return false;
  const { website } = body as Record<string, unknown>;
  return typeof website === "string" && website.trim().length > 0;
};

// LINE accepts newlines in message text, so the submission keeps its shape —
// no flattening needed, unlike WhatsApp's template parameters.
const buildMessage = ({ name, email, content }: ContactSubmission): string =>
  [
    "📮 New portfolio message",
    `From: ${name}`,
    `Email: ${email}`,
    "",
    content,
  ].join("\n");

const handler = async (
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> => {
  if (!guardRequest(request, response)) return;

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;
  if (!token || !userId) {
    console.error(
      "Contact endpoint is missing LINE_CHANNEL_ACCESS_TOKEN and/or LINE_USER_ID",
    );
    response.status(500).json({ error: "server_misconfigured" });
    return;
  }

  // Answer bots with the same 200 a real submission gets: telling them they were
  // detected just invites another attempt with the field left blank.
  if (isBot(request.body)) {
    console.warn("Contact submission rejected: honeypot filled");
    response.status(200).json({ ok: true });
    return;
  }

  const submission = parseSubmission(request.body);
  if (!submission) {
    response.status(400).json({ error: "invalid_request" });
    return;
  }

  // Deliberately after validation: the budget exists to cap messages actually
  // sent, and a rejected payload sends nothing. Counting malformed requests
  // would let three typos lock a real visitor out for an hour.
  const { allowed, retryAfterSeconds } = checkRateLimit(clientKey(request));
  if (!allowed) {
    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.status(429).json({ error: "rate_limited", retryAfterSeconds });
    return;
  }

  try {
    const lineResponse = await fetch(LINE_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: buildMessage(submission) }],
      }),
    });

    if (!lineResponse.ok) {
      // Log the provider's reason server-side; never forward it to the browser,
      // since provider errors can echo back request details.
      console.error(
        `LINE push failed (${lineResponse.status}):`,
        (await lineResponse.text()).slice(0, 800),
      );
      // 429 from LINE means the monthly push quota is exhausted — surface it as
      // a retryable condition rather than a generic failure.
      const status = lineResponse.status === 429 ? 429 : 502;
      response.status(status).json({ error: "upstream_error" });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Unexpected failure handling contact submission:", error);
    response.status(500).json({ error: "internal_error" });
  }
};

export default handler;
