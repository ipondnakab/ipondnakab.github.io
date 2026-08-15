"use client";

import {
  Button,
  Card,
  Image,
  Spinner,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose, IoSend } from "react-icons/io5";

import { environment } from "@/core/environment";
import { ChatMessage } from "@/interfaces/chat";
import { trackEvent } from "@/libs/analytics";
import { cn } from "@nextui-org/theme";

export interface ChatWidgetProps {
  className?: string;
}

// Matches MAX_MESSAGES in portfolio-api/api/chat.ts. Older turns are dropped from the
// request (not from the visible transcript) so a long conversation keeps working
// instead of starting to 400.
const MAX_TURNS_SENT = 20;

// The site mascot, reused as the assistant's face (see components/layouts/
// Khunkao.tsx for the original character).
//
// This is a 192px-wide downscale of images/khunkao.png, not the original: the
// launcher renders on every route at 56px, and the full-size asset is 1.1 MB —
// `images.unoptimized` is set in next.config.js, so Next will not resize it for
// us. Regenerate with:
//   sips --resampleWidth 192 public/images/khunkao.png \
//     --out public/images/khunkao-avatar.png
//
// Absolute rather than "./images/..." because the widget renders on nested
// routes too (e.g. /drunkard-game/privacy), where a relative path resolves wrongly.
const KHUNKAO_AVATAR = "/images/khunkao-avatar.png";

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
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
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
    setIsDismissed(
      window.sessionStorage?.getItem(DISMISSED_STORAGE_KEY) === "1",
    );
  }, []);

  const handleDismiss = () => {
    window.sessionStorage?.setItem(DISMISSED_STORAGE_KEY, "1");
    setIsDismissed(true);
    setIsOpen(false);
    trackEvent("chat_dismissed");
  };

  useEffect(() => {
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isSending]);

  useEffect(() => {
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
  }, []);

  const handleToggle = () => {
    setIsOpen((open) => {
      if (!open) trackEvent("chat_open");
      return !open;
    });
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

      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.reply as string },
      ]);
    } catch {
      // Network failure, DNS, CORS rejection — nothing actionable to show the
      // visitor beyond "try again".
      setError(t("chat.errors.offline"));
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, messages, t]);

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
        "fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6",
        className,
      )}
    >
      {isOpen && (
        <Card className="flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden p-0 shadow-xl">
          <div className="flex items-center justify-between border-b border-default-200 px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Decorative: the name sits directly beside it, so alt is empty
                  to avoid a screen reader announcing it twice. */}
              <Image
                removeWrapper
                disableSkeleton
                src={KHUNKAO_AVATAR}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full bg-default-100 object-cover object-top"
              />
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
              onPress={() => setIsOpen(false)}
            >
              <IoClose size={18} />
            </Button>
          </div>

          <div
            ref={transcriptRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 && (
              <p className="text-small text-default-500">
                {t("chat.greeting")}
              </p>
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

          <div className="flex items-end gap-2 border-t border-default-200 px-3 py-3">
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

      <div className="relative">
        {/* Suppressed while the panel is open: the button is a close control then,
          and "click to chat" would describe the wrong action. */}
        <Tooltip
          content={t("chat.tooltip")}
          placement="left"
          showArrow
          isDisabled={isOpen}
          delay={300}
          // Controlled throughout, so React never sees a controlled →
          // uncontrolled switch. During the intro, hover and focus are ignored;
          // afterwards onOpenChange is the only thing driving it.
          isOpen={isTooltipOpen && !isOpen}
          onOpenChange={(open) => {
            if (!isIntroPlaying) setIsTooltipOpen(open);
          }}
        >
          <Button
            isIconOnly
            radius="full"
            size="lg"
            className={cn(
              "h-14 w-14 overflow-visible min-w-14 p-0 shadow-lg",
              isOpen ? "bg-default-100" : "bg-transparent",
            )}
            aria-label={isOpen ? t("chat.close") : t("chat.open")}
            onPress={handleToggle}
          >
            {isOpen ? (
              <IoClose size={22} />
            ) : (
              // Flipped horizontally so the cat faces into the page rather than off
              // the right edge — same treatment as the original mascot component.
              <Image
                removeWrapper
                disableSkeleton
                src={KHUNKAO_AVATAR}
                alt=""
                className="h-full w-full scale-x-[-1] object-cover object-top"
              />
            )}
          </Button>
        </Tooltip>

        {/* Dismiss badge. Only offered while the panel is closed — with it open
            the header already has a close control, and hiding the launcher
            out from under an active conversation would be jarring. */}
        {!isOpen && (
          <Button
            isIconOnly
            radius="full"
            size="sm"
            aria-label={t("chat.hide")}
            className="absolute -right-1 -top-1 h-6 min-h-6 w-6 min-w-6 bg-default-200 p-0 text-default-700 shadow-md"
            onPress={handleDismiss}
          >
            <IoClose size={12} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
