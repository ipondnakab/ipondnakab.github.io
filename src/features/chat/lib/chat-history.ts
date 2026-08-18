import { doc, setDoc } from "firebase/firestore";

import { ChatMessage, ChatTranscript } from "@/features/chat/model/chat";
import { KHUNKAO_CHAT_DB_NAME } from "@/shared/config/database-name";
import { db } from "@/shared/lib/firebase";

// Records KhunKao conversations so Kittipat can see what visitors actually ask.
//
// Written from the browser rather than from portfolio-api, matching how
// Planning Poker already uses Firestore: no service-account key to store and no
// firebase-admin dependency. The trade is that the collection is publicly
// writable, so treat its contents as untrusted input — someone could POST junk
// straight to Firestore. That is a nuisance, not an exposure, since nothing
// reads these documents back into the site.
//
// ⚠️ Firestore rules must allow create/update on this collection, e.g.
//     match /khunkao-chat/{id} {
//       allow create, update: if true;
//       allow read, delete: if false;   // only you, via the console
//     }
// Denying `read` matters: without it, one visitor could read another's
// conversation.
//
// ⚠️ Retention: each document carries `expiresAt`. Turn on a TTL policy in the
// Firebase console (Firestore → TTL → collection `khunkao-chat`, field
// `expiresAt`) and Google deletes them automatically. Without that policy
// transcripts are kept forever, which is not what the widget's notice promises.

const RETENTION_DAYS = 90;

const SESSION_STORAGE_KEY = "chat.sessionId";
const STARTED_AT_STORAGE_KEY = "chat.startedAt";

// One id per browser tab, so a visitor moving between pages keeps appending to
// the same transcript instead of scattering one conversation across documents.
const getSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id =
      window.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage?.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    // Private browsing can throw on sessionStorage access. Losing the log is
    // never worth breaking the chat, so give up quietly.
    return null;
  }
};

export const saveChatTranscript = async (
  messages: ChatMessage[],
  language: string,
): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId || messages.length === 0) return;

  const now = new Date();

  // `merge` merges fields, it does not protect them — sending startedAt on
  // every write would keep overwriting it with the latest time. Pin it once,
  // in storage, so it survives a reload too.
  let startedAt: string;
  try {
    startedAt =
      window.sessionStorage?.getItem(STARTED_AT_STORAGE_KEY) ??
      now.toISOString();
    window.sessionStorage?.setItem(STARTED_AT_STORAGE_KEY, startedAt);
  } catch {
    startedAt = now.toISOString();
  }

  const transcript: ChatTranscript = {
    messages,
    language,
    startedAt,
    updatedAt: now.toISOString(),
    // Refreshed on every write, so an active conversation isn't deleted
    // mid-flight by the TTL policy.
    expiresAt: new Date(now.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000),
  };

  try {
    await setDoc(doc(db, KHUNKAO_CHAT_DB_NAME, sessionId), transcript, {
      merge: true,
    });
  } catch (error) {
    // Logging is a side benefit; a failed write must never surface to the
    // visitor or interrupt the conversation.
    console.warn("Could not record chat transcript:", error);
  }
};
