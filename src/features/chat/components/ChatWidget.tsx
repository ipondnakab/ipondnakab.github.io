"use client";

import { Button, Card, Spinner, Textarea, Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose, IoSend } from "react-icons/io5";

import {
  MASCOT_REPLY_DURATION_MS,
  MASCOT_TRAVEL_DURATION_MS,
} from "@/features/chat/constants";
import { saveChatTranscript } from "@/features/chat/lib/chat-history";
import { ChatMessage } from "@/features/chat/model/chat";
import type { MascotPhase, MascotState } from "@/features/chat/model/mascot";
import { environment } from "@/shared/config/environment";
import { trackEvent } from "@/shared/lib/analytics";
import PixelKhunKao from "./PixelKhunKao";

export interface ChatWidgetProps {
  className?: string;
}

// Matches MAX_MESSAGES in portfolio-api/api/chat.ts. Older turns are dropped from the
// request (not from the visible transcript) so a long conversation keeps working
// instead of starting to 400.
const MAX_TURNS_SENT = 20;

// A dismissed session never mounts this component or downloads the sprite atlas.
const ChatMascot = dynamic(() => import("./ChatMascot"), {
  ssr: false,
  loading: () => <PixelKhunKao className="h-full w-full" />,
});

// The tooltip announces itself once after the page settles, so visitors notice
// the launcher without having to hover it. The settle delay keeps it from
// appearing while the route is still painting — several pages mount heavy
// content (BackgroundParticles, the 3D résumé) right as this component does.
const TOOLTIP_INTRO_DELAY_MS = 800;
const TOOLTIP_INTRO_DURATION_MS = 5000;

// Dismissing the launcher hides it for the rest of the browsing session.
// sessionStorage rather than localStorage is deliberate: "not right now" should
// not mean "never again" — a new tab or a return visit brings KhunKao back.
const DISMISSED_STORAGE_KEY = "chat.dismissed";

const ChatWidget: React.FC<ChatWidgetProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<MascotPhase>("closed");
  const reducedMotion = useReducedMotion();
  const skipMotion = reducedMotion !== false;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  // While the intro is playing the tooltip ignores hover/focus, so moving the
  // cursor away can't cut the 5 seconds short. Once it ends, the Tooltip goes
  // back to being driven entirely by onOpenChange.
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  // null until the effect below has read sessionStorage, which does not exist
  // while the static export is prerendered.
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISSED_STORAGE_KEY) === "1";
    } catch {
      // Keep the cat usable when browser storage is blocked.
    }
    setIsDismissed(dismissed);
    setPhase(dismissed ? "closed" : "loading");
  }, []);

  useEffect(() => {
    if (!isReplying) return;
    const timer = setTimeout(
      () => setIsReplying(false),
      MASCOT_REPLY_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [isReplying]);

  const mascotState: MascotState = isSending
    ? "thinking"
    : isReplying
      ? "replying"
      : "idle";

  const handleMascotReady = useCallback(() => {
    setPhase((current) =>
      current === "loading" ? (skipMotion ? "active" : "entering") : current,
    );
  }, [skipMotion]);

  useEffect(() => {
    if (phase !== "entering" && phase !== "exiting") return;
    const finish = () => {
      if (phase === "exiting") {
        setPhase("closed");
        setIsDismissed(true);
      } else {
        setPhase("active");
      }
    };
    if (skipMotion) {
      finish();
      return;
    }
    const timer = setTimeout(finish, MASCOT_TRAVEL_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase, skipMotion]);

  const handleClose = () => {
    setIsOpen(false);
    setIsTooltipOpen(false);
  };

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, "1");
    } catch {
      // Dismiss for this mount even when the browser cannot remember it.
    }
    setIsOpen(false);
    setIsTooltipOpen(false);
    setPhase("exiting");
    trackEvent("chat_dismissed");
  };

  useEffect(() => {
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isSending]);

  useEffect(() => {
    if (phase !== "active" || !isIntroPlaying) return;
    const showTimer = setTimeout(
      () => setIsTooltipOpen(true),
      TOOLTIP_INTRO_DELAY_MS,
    );
    const hideTimer = setTimeout(() => {
      setIsTooltipOpen(false);
      setIsIntroPlaying(false);
    }, TOOLTIP_INTRO_DELAY_MS + TOOLTIP_INTRO_DURATION_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [phase, isIntroPlaying]);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
      return;
    }
    trackEvent("chat_open");
    setIsOpen(true);
    setIsTooltipOpen(false);
  };

  const handleSend = useCallback(async () => {
    const question = draft.trim();
    if (!question || isSending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsReplying(false);
    setIsSending(true);
    trackEvent("chat_message_sent", { length: question.length });

    try {
      const response = await fetch(environment.chatApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-MAX_TURNS_SENT) }),
      });

      if (!response.ok) {
        setError(
          response.status === 429
            ? t("chat.errors.rateLimited")
            : t("chat.errors.generic"),
        );
        return;
      }

      const payload = (await response.json()) as { reply?: string };
      if (!payload.reply) {
        setError(t("chat.errors.generic"));
        return;
      }

      const withReply: ChatMessage[] = [
        ...nextMessages,
        { role: "assistant", content: payload.reply },
      ];
      setMessages(withReply);
      setIsReplying(true);
      // Fire-and-forget: recording is a side benefit, so it must not delay the
      // reply appearing or fail the turn. saveChatTranscript swallows its own
      // errors.
      void saveChatTranscript(withReply, i18n.language);
    } catch {
      // Network failure, DNS, CORS rejection — nothing actionable to show the
      // visitor beyond "try again".
      setError(t("chat.errors.offline"));
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, messages, t, i18n]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  // Without a configured endpoint every send would fail, so hide the entry point
  // entirely rather than offering a broken affordance.
  //
  // `isDismissed !== false` also covers the null case: rendering nothing until
  // sessionStorage has been read avoids a hydration mismatch and stops a
  // launcher the visitor already dismissed from flashing on screen first.
  if (!environment.chatApiUrl || isDismissed !== false) return null;

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3",
        className,
      )}
    >
      {isOpen && (
        <Card className="flex h-[min(28rem,calc(100dvh-10rem))] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden p-0 shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-default-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{t("chat.title")}</span>
                <span className="text-tiny text-default-500">
                  {t("chat.subtitle")}
                </span>
              </div>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label={t("chat.close")}
              onPress={handleClose}
            >
              <IoClose size={18} />
            </Button>
          </div>

          <div className="flex shrink-0 justify-center border-b border-default-200 bg-primary/5 px-4 py-2">
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="rounded-full bg-content1/80 px-3 py-1 text-tiny text-default-600"
            >
              {t(`chat.mascot.${mascotState}`)}
            </span>
          </div>

          <div
            ref={transcriptRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-small text-default-500">
                  {t("chat.greeting")}
                </p>
                {/* Conversations are stored in Firestore (libs/chat-history.ts),
                    so say so. Shown once, before anything is typed — the point
                    is to inform before the visitor commits, not to nag. */}
                <p className="text-tiny text-default-400">
                  {t("chat.savedNotice")}
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={clsx(
                  "max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-small",
                  message.role === "user"
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-default-100",
                )}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="self-start rounded-xl bg-default-100 px-3 py-2">
                <Spinner size="sm" />
              </div>
            )}
            {error && (
              <p className="text-tiny text-danger" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-end gap-2 border-t border-default-200 px-3 py-3">
            <Textarea
              minRows={1}
              maxRows={4}
              size="sm"
              variant="bordered"
              value={draft}
              onValueChange={setDraft}
              onKeyDown={handleKeyDown}
              aria-label={t("chat.inputLabel")}
              placeholder={t("chat.placeholder")}
              isDisabled={isSending}
            />
            <Button
              isIconOnly
              color="primary"
              size="sm"
              aria-label={t("chat.send")}
              isDisabled={isSending || draft.trim().length === 0}
              onPress={() => void handleSend()}
            >
              <IoSend size={16} />
            </Button>
          </div>
        </Card>
      )}

      <div className="relative h-28 w-28">
        <div className="pointer-events-none fixed bottom-6 right-0 h-28 w-40 overflow-hidden">
          <motion.div
            data-testid="chat-companion"
            data-phase={phase}
            className="pointer-events-auto absolute bottom-0 right-6 h-28 w-28"
            initial={{ x: skipMotion ? 0 : 224 }}
            animate={{
              x: phase === "loading" || phase === "exiting" ? 224 : 0,
            }}
            transition={{
              duration: skipMotion ? 0 : MASCOT_TRAVEL_DURATION_MS / 1000,
              ease: "linear",
            }}
          >
            <Tooltip
              content={t("chat.tooltip")}
              placement="left"
              showArrow
              isDisabled={isOpen || phase !== "active"}
              delay={300}
              isOpen={isTooltipOpen && !isOpen && phase === "active"}
              onOpenChange={(open) => {
                if (!isIntroPlaying) setIsTooltipOpen(open);
              }}
            >
              <Button
                isIconOnly
                radius="full"
                size="lg"
                className="h-28 w-28 min-w-28 overflow-visible bg-transparent p-0 shadow-none data-[disabled=true]:opacity-100"
                aria-label={isOpen ? t("chat.close") : t("chat.open")}
                isDisabled={phase !== "active"}
                onPress={handleToggle}
              >
                <ChatMascot
                  state={
                    phase === "entering" || phase === "exiting"
                      ? "walking"
                      : mascotState
                  }
                  facing={
                    phase === "entering"
                      ? "left"
                      : phase === "exiting"
                        ? "right"
                        : "front"
                  }
                  onReady={handleMascotReady}
                />
              </Button>
            </Tooltip>

            {phase === "active" && (
              <Button
                isIconOnly
                radius="full"
                size="sm"
                aria-label={t("chat.hide")}
                className="absolute right-0 top-0 h-6 min-h-6 w-6 min-w-6 bg-default-200 p-0 text-default-700 shadow-md"
                onPress={handleDismiss}
              >
                <IoClose size={12} />
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
