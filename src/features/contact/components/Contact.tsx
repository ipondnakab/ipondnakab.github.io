"use client";

import { Button, Card, Divider, Link as NextUILink } from "@nextui-org/react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMail, HiOutlineUser } from "react-icons/hi";
import { IoChatbubbleEllipsesOutline, IoSend } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";

import FormHookWrapper, {
  FormHookWrapperRef,
} from "@/components/form-hook-wrapper/FormHookWrapper";
import InputString from "@/components/inputs/InputString";
import InputTextarea from "@/components/inputs/InputTextarea";
import ProfileAvatar from "@/components/readme/ProfileAvatar";
import { SOCIALS } from "@/constants/social";
import { environment } from "@/core/environment";
import { ContactForm } from "@/interfaces/contact";
import { trackEvent } from "@/libs/analytics";

export interface ContactProps {}

const defaultValues: ContactForm = {
  name: "",
  email: "",
  content: "",
};

// Mirrors MAX_CONTENT_CHARS in portfolio-api/api/contact.ts, which is bounded by
// LINE's 5,000-character text message.
const MAX_CONTENT = 2000;

// Below this the counter turns amber, so the limit is felt before it is hit.
const COUNTER_WARN_AT = 200;

const STORAGE_KEYS = ["name", "email", "content"] as const;

const Contact: React.FC<ContactProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const formRef: React.ForwardedRef<FormHookWrapperRef<ContactForm>> =
    useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Kept outside react-hook-form so the value never reaches ContactForm, which
  // describes what a real visitor submits.
  const honeypotRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: ContactForm) => {
    if (!environment.contactApiUrl) {
      // Nothing is configured to receive this. Say so rather than showing the
      // success page for a message that was never sent.
      trackEvent("contact_submit", { status: "unconfigured" });
      setError(t("contact.sendError"));
      return;
    }

    setIsLoading(true);
    setError(null);
    trackEvent("contact_submit", { status: "attempt" });
    try {
      const response = await fetch(environment.contactApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          content: data.content,
          // Honeypot — see the hidden field below.
          website: honeypotRef.current?.value ?? "",
        }),
      });

      if (!response.ok) {
        trackEvent("contact_submit", { status: "error" });
        setError(
          response.status === 429
            ? t("contact.sendRateLimited")
            : t("contact.sendError"),
        );
        return;
      }

      trackEvent("contact_submit", { status: "success" });
      // The draft is only kept so a half-written message survives a reload;
      // once it is delivered, leaving it behind just repopulates the form.
      STORAGE_KEYS.forEach((key) =>
        window.localStorage?.removeItem(`form.contact.${key}`),
      );
      router.push("/contact/success");
    } catch {
      trackEvent("contact_submit", { status: "error" });
      setError(t("contact.sendError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formRef.current && window?.localStorage) {
      STORAGE_KEYS.forEach((key) => {
        const saved = window.localStorage.getItem(`form.contact.${key}`);
        formRef.current?.setValue(key, saved || "");
      });
      if (window.localStorage.getItem("form.contact.email")) {
        formRef.current.trigger("email");
      }
    }
  }, []);

  const fade = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    // Centred in the remaining viewport on large screens so the page doesn't
    // sit in the top half with a void beneath it. Left as normal flow below
    // `lg`, where the stacked cards fill the height on their own.
    <div className="mx-auto flex w-full max-w-6xl flex-col justify-center p-2 sm:p-8 lg:min-h-[calc(100vh-4rem)]">
      {/* items-stretch (the default) keeps both cards the same height, so the
          two columns line up top and bottom instead of ending raggedly. */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        {/* Why get in touch — sets expectations before the form asks for effort */}
        <motion.div className="flex lg:w-[40%]" {...fade(0)}>
          <Card isBlurred className="w-full gap-5 p-6 sm:p-8">
            {/* Title beside the avatar. It wraps to two lines at this column
                width — leading-tight keeps that reading as a deliberate stacked
                heading rather than a cramped accident. */}
            <div className="flex items-center gap-4">
              <ProfileAvatar className="h-20 w-20 shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
                  {t("contact.title")}
                </h1>
                <span className="text-small text-default-500">
                  Kittipat Daengdee
                </span>
              </div>
            </div>

            <p className="text-small leading-relaxed text-default-600">
              {t("contact.intro")}
            </p>

            <div className="flex flex-col gap-2">
              <span className="text-tiny font-semibold uppercase tracking-[0.2em] text-default-500">
                {t("contact.openToTitle")}
              </span>
              {[
                t("contact.openToWork"),
                t("contact.openToRoles"),
                t("contact.openToQuestions"),
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span className="text-small text-default-700">{item}</span>
                </div>
              ))}
            </div>

            {/* mt-auto pins the social row to the bottom of the card, so the
                two columns end level however tall the form grows. */}
            <Divider className="mt-auto" />

            <div className="flex flex-col gap-3">
              <span className="text-tiny font-semibold uppercase tracking-[0.2em] text-default-500">
                {t("contact.orReachMe")}
              </span>
              <div className="flex items-center gap-4 text-2xl">
                {SOCIALS.map((social) => (
                  <NextUILink
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    color="foreground"
                    aria-label={social.name}
                    className="transition-colors duration-300 hover:text-primary"
                    onPress={() =>
                      trackEvent("social_click", {
                        network: social.name,
                        location: "contact",
                      })
                    }
                  >
                    {social.icon}
                  </NextUILink>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* The form itself */}
        <motion.div className="flex lg:flex-1" {...fade(0.12)}>
          <Card isBlurred className="w-full p-6 sm:p-8">
            <FormHookWrapper<ContactForm>
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              ref={formRef}
            >
              {({ setValue, trigger, watch }) => {
                const used = (watch("content") || "").length;
                const remaining = MAX_CONTENT - used;

                const handleChangeValue =
                  (name: (typeof STORAGE_KEYS)[number]) =>
                  (e?: React.ChangeEvent<HTMLInputElement>) => {
                    if (window?.localStorage)
                      window.localStorage.setItem(
                        `form.contact.${name}`,
                        e?.target.value || "",
                      );
                    setValue(name, e?.target.value || "");
                    trigger(name);
                  };

                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <InputString
                        name="name"
                        variant="bordered"
                        labelPlacement="outside"
                        // Without this the placeholder only appears on focus,
                        // so every field reads as an empty box until clicked.
                        disableAutoPlaceholder
                        startContent={
                          <HiOutlineUser className="shrink-0 text-default-400" />
                        }
                        rules={{ required: t("contact.nameRequired") }}
                        placeholder={t("contact.enterName")}
                        label={t("contact.name")}
                        onChange={handleChangeValue("name")}
                        onClear={handleChangeValue("name")}
                      />
                      <InputString
                        name="email"
                        type="email"
                        variant="bordered"
                        labelPlacement="outside"
                        disableAutoPlaceholder
                        startContent={
                          <HiOutlineMail className="shrink-0 text-default-400" />
                        }
                        rules={{
                          required: t("contact.emailRequired"),
                          pattern: {
                            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: t("contact.emailInvalid"),
                          },
                        }}
                        placeholder={t("contact.enterEmail")}
                        label={t("contact.email")}
                        onChange={handleChangeValue("email")}
                        onClear={handleChangeValue("email")}
                      />
                    </div>

                    <InputTextarea
                      name="content"
                      variant="bordered"
                      labelPlacement="outside"
                      minRows={7}
                      disableAutoPlaceholder
                      rules={{
                        required: t("contact.contentRequired"),
                        maxLength: {
                          value: MAX_CONTENT,
                          message: t("contact.contentTooLong"),
                        },
                      }}
                      placeholder={t("contact.enterContent")}
                      label={t("contact.content")}
                      onChange={handleChangeValue("content")}
                    />

                    {/* Always visible so the budget is known before writing, not
                        discovered at the limit. The digits carry the meaning in
                        any language; aria-label gives screen readers the
                        translated sentence, which "1234 / 2000" alone doesn't. */}
                    <div className="-mt-2 flex justify-end">
                      <span
                        aria-label={t("contact.charactersLeft", {
                          count: remaining,
                        })}
                        className={clsx(
                          "text-tiny tabular-nums transition-colors",
                          remaining < 0
                            ? "text-danger"
                            : remaining <= COUNTER_WARN_AT
                              ? "text-warning"
                              : "text-default-400",
                        )}
                      >
                        {used} / {MAX_CONTENT}
                      </span>
                    </div>

                    {/* Honeypot. Hidden from people and from assistive tech, but a
                        form-filling bot sees an input named "website" and completes
                        it — which is how the API recognises the submission as spam.
                        Not display:none, which some bots skip. */}
                    <input
                      ref={honeypotRef}
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    />

                    {/* Replaces window.alert(): an inline, themed, screen-reader
                        announced message that does not interrupt the page. */}
                    {error && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-medium border border-danger/30 bg-danger/10 px-3 py-2 text-small text-danger"
                      >
                        <MdErrorOutline className="mt-[3px] shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      isLoading={isLoading}
                      endContent={!isLoading && <IoSend />}
                      className="font-semibold"
                    >
                      {t("contact.submit")}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-tiny text-default-500">
                      <IoChatbubbleEllipsesOutline className="shrink-0" />
                      <span>{t("contact.responseNote")}</span>
                    </div>
                  </div>
                );
              }}
            </FormHookWrapper>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
