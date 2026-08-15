import type { VercelRequest, VercelResponse } from "@vercel/node";

import { clientKey, guardRequest } from "../lib/cors";
import { SYSTEM_PROMPT } from "../lib/knowledge";
import { createRateLimiter } from "../lib/rate-limit";

const checkRateLimit = createRateLimiter({ windowMs: 60_000, max: 10 });

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Caps chosen to bound cost and abuse, not because the model requires them.
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 1_000;
const MAX_COMPLETION_TOKENS = 400;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== "object" || value === null) return false;
  const { role, content } = value as Record<string, unknown>;
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.trim().length > 0 &&
    content.length <= MAX_CHARS_PER_MESSAGE
  );
};

const parseMessages = (body: unknown): ChatMessage[] | null => {
  if (typeof body !== "object" || body === null) return null;
  const { messages } = body as Record<string, unknown>;
  if (!Array.isArray(messages)) return null;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  if (!messages.every(isChatMessage)) return null;
  // The transcript must end on the visitor's turn, or there is nothing to answer.
  if (messages[messages.length - 1].role !== "user") return null;
  return messages;
};

// Thai Unicode block. Any Thai character in the visitor's message is treated as
// "this person is writing Thai" — mixed Thai/English input is common and Thai is
// the right answer language there.
const THAI_SCRIPT = /[฀-๿]/;

// The assistant answers in English and Thai only. Asking for that in the system
// prompt does NOT work: Llama mirrors the visitor's language regardless of where
// or how emphatically the rule is stated (verified against Japanese, Chinese and
// Swedish input). A short directive appended *after* the conversation carries far
// more weight than the same rule at the top of a ~2,700-token system prompt, so
// the language choice is made here in code and restated last.
const languageDirective = (messages: ChatMessage[]): string => {
  const latestQuestion = messages[messages.length - 1].content;
  return THAI_SCRIPT.test(latestQuestion)
    ? "The visitor wrote in Thai. Write your entire reply in Thai."
    : "The visitor did not write in Thai. Write your entire reply in English, " +
        "even though their message was in another language. Every sentence you " +
        "write must be English. Do not mention the language or apologise for it.";
};

const handler = async (
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> => {
  if (!guardRequest(request, response)) return;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set on this deployment");
    response.status(500).json({ error: "server_misconfigured" });
    return;
  }

  const { allowed, retryAfterSeconds } = checkRateLimit(clientKey(request));
  if (!allowed) {
    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.status(429).json({ error: "rate_limited", retryAfterSeconds });
    return;
  }

  const messages = parseMessages(request.body);
  if (!messages) {
    response.status(400).json({ error: "invalid_request" });
    return;
  }

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: MAX_COMPLETION_TOKENS,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          { role: "system", content: languageDirective(messages) },
        ],
      }),
    });

    if (!groqResponse.ok) {
      // Log the provider's reason server-side; never forward it to the browser,
      // since provider errors can echo back request details.
      console.error(
        `Groq request failed (${groqResponse.status}):`,
        await groqResponse.text(),
      );
      // Groq's own quota exhaustion is a retryable condition for the visitor.
      const status = groqResponse.status === 429 ? 429 : 502;
      response.status(status).json({ error: "upstream_error" });
      return;
    }

    const payload = (await groqResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = payload.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error(
        "Groq returned no message content:",
        JSON.stringify(payload),
      );
      response.status(502).json({ error: "empty_response" });
      return;
    }

    response.status(200).json({ reply });
  } catch (error) {
    console.error("Unexpected failure handling chat request:", error);
    response.status(500).json({ error: "internal_error" });
  }
};

export default handler;
