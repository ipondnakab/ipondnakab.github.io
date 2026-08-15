// A single turn in the portfolio assistant conversation. Mirrors the shape the
// chat endpoint accepts (see portfolio-api/api/chat.ts) — only visitor and assistant
// turns travel over the wire; the system prompt is added server-side so it can
// never be overridden from the browser.
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
