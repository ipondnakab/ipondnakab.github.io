// A single turn in the portfolio assistant conversation. Mirrors the shape the
// chat endpoint accepts (see portfolio-api/api/chat.ts) — only visitor and assistant
// turns travel over the wire; the system prompt is added server-side so it can
// never be overridden from the browser.
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// One visitor's conversation, stored so Kittipat can see what people ask.
//
// Deliberately minimal: no IP, no user agent, no fingerprinting. The language
// is kept only because "which languages do visitors actually use" is the one
// non-content question worth answering, and it is not identifying on its own.
export interface ChatTranscript {
  messages: ChatMessage[];
  language: string;
  startedAt: string;
  updatedAt: string;
  // Lets a Firestore TTL policy delete old transcripts automatically — see
  // libs/chat-history.ts for how to switch it on.
  expiresAt: Date;
}
