import type { VercelRequest, VercelResponse } from "@vercel/node";

import { clientKey } from "../lib/cors";
import { createRateLimiter } from "../lib/rate-limit";

const LINE_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";

const MAX_NAME_CHARS = 100;
const MAX_EMAIL_CHARS = 200;
const MAX_CONTENT_CHARS = 2_000;

const RATE_LIMIT_PER_HOUR = 3;
const SECRET_HEADER = "x-secret-key";

const checkRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: RATE_LIMIT_PER_HOUR,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DrunkardGameSubmission {
  name: string;
  email: string;
  content: string;
}

const isNonEmptyString = (value: unknown, maxChars: number): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxChars;

export const verifySecretHeader = (request: VercelRequest): boolean => {
  const secret = process.env.DRUNKARD_GAME_SECRET_KEY ?? "";
  const header = request.headers[SECRET_HEADER];
  const candidate = Array.isArray(header) ? header[0] : header;

  return (
    typeof candidate === "string" && candidate === secret && secret.length > 0
  );
};

export const parseDrunkardGamePayload = (
  body: unknown,
): DrunkardGameSubmission | null => {
  if (typeof body !== "object" || body === null) return null;

  const { name, email, content, website } = body as Record<string, unknown>;

  if (typeof website === "string" && website.trim().length > 0) {
    return null;
  }

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

const buildMessage = ({
  name,
  email,
  content,
}: DrunkardGameSubmission): string =>
  [
    "📮 Drunkard Game contact",
    `From: ${name}`,
    `Email: ${email}`,
    "",
    content,
  ].join("\n");

const handler = async (
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> => {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  if (!verifySecretHeader(request)) {
    response.status(401).json({ error: "unauthorized" });
    return;
  }

  const payload = parseDrunkardGamePayload(request.body);
  if (!payload) {
    response.status(400).json({ error: "invalid_request" });
    return;
  }

  const { allowed, retryAfterSeconds } = checkRateLimit(clientKey(request));
  if (!allowed) {
    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.status(429).json({ error: "rate_limited", retryAfterSeconds });
    return;
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;
  if (!token || !userId) {
    console.error(
      "Drunkard Game endpoint is missing LINE_CHANNEL_ACCESS_TOKEN and/or LINE_USER_ID",
    );
    response.status(500).json({ error: "server_misconfigured" });
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
        messages: [{ type: "text", text: buildMessage(payload) }],
      }),
    });

    if (!lineResponse.ok) {
      console.error(
        `LINE push failed (${lineResponse.status}):`,
        (await lineResponse.text()).slice(0, 800),
      );
      const status = lineResponse.status === 429 ? 429 : 502;
      response.status(status).json({ error: "upstream_error" });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error(
      "Unexpected failure handling drunkard-game submission:",
      error,
    );
    response.status(500).json({ error: "internal_error" });
  }
};

export default handler;
