import type { VercelRequest, VercelResponse } from "@vercel/node";

import { clientKey, guardRequest } from "../lib/cors";
import { createRateLimiter } from "../lib/rate-limit";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Resend's shared sender. It requires no DNS setup, but will only deliver to the
// address that owns the Resend account — which is exactly this use case, since
// the only recipient is Kittipat himself. To send from contact@kittipat.dev
// instead, verify the domain in Resend and set CONTACT_FROM.
const DEFAULT_FROM = "Portfolio <onboarding@resend.dev>";

const MAX_NAME_CHARS = 100;
const MAX_EMAIL_CHARS = 200;
const MAX_CONTENT_CHARS = 5_000;

// Far stricter than the chat endpoint: a human sends one message and leaves,
// so anything beyond a few per hour is a bot or a mistake.
const checkRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
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

// Header values cannot contain newlines — otherwise a crafted name could inject
// extra headers (Bcc, Reply-To) into the outgoing message.
const singleLine = (value: string): string =>
  value.replace(/[\r\n]+/g, " ").trim();

const handler = async (
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> => {
  if (!guardRequest(request, response)) return;

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_EMAIL;
  if (!apiKey || !recipient) {
    console.error(
      "Contact endpoint is missing RESEND_API_KEY and/or CONTACT_EMAIL",
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

  // Deliberately after validation: the budget exists to cap emails actually
  // sent, and a rejected payload sends nothing. Counting malformed requests
  // would let three typos lock a real visitor out for an hour.
  const { allowed, retryAfterSeconds } = checkRateLimit(clientKey(request));
  if (!allowed) {
    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.status(429).json({ error: "rate_limited", retryAfterSeconds });
    return;
  }

  try {
    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || DEFAULT_FROM,
        to: [recipient],
        // Lets Kittipat hit reply in his mail client and answer the visitor
        // directly, rather than copying the address out of the body.
        reply_to: submission.email,
        subject: `Portfolio message from ${singleLine(submission.name)}`,
        text: [
          `Name:  ${submission.name}`,
          `Email: ${submission.email}`,
          "",
          submission.content,
        ].join("\n"),
      }),
    });

    if (!resendResponse.ok) {
      // Log the provider's reason server-side; never forward it to the browser,
      // since provider errors can echo back request details.
      console.error(
        `Resend request failed (${resendResponse.status}):`,
        await resendResponse.text(),
      );
      response.status(502).json({ error: "upstream_error" });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Unexpected failure handling contact submission:", error);
    response.status(500).json({ error: "internal_error" });
  }
};

export default handler;
