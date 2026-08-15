"use client";
import { Button, Card } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import FormHookWrapper, {
  FormHookWrapperRef,
} from "@/components/form-hook-wrapper/FormHookWrapper";
import InputString from "@/components/inputs/InputString";
import InputTextarea from "@/components/inputs/InputTextarea";
import { environment } from "@/core/environment";
import { ContactForm } from "@/interfaces/contact";
import { trackEvent } from "@/libs/analytics";

export interface ContactProps {}

const defaultValues: ContactForm = {
  name: "",
  email: "",
  content: "",
};

const Contact: React.FC<ContactProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const formRef: React.ForwardedRef<FormHookWrapperRef<ContactForm>> =
    useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  // Kept outside react-hook-form so the value never reaches ContactForm, which
  // describes what a real visitor submits.
  const honeypotRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: ContactForm) => {
    if (!environment.contactApiUrl) {
      // Nothing is configured to receive this. Say so rather than showing the
      // success page for a message that was never sent.
      trackEvent("contact_submit", { status: "unconfigured" });
      alert(t("contact.sendError"));
      return;
    }

    setIsLoading(true);
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
        alert(
          response.status === 429
            ? t("contact.sendRateLimited")
            : t("contact.sendError"),
        );
        return;
      }

      trackEvent("contact_submit", { status: "success" });
      // The draft is only kept so a half-written message survives a reload;
      // once it is delivered, leaving it behind just repopulates the form.
      window.localStorage?.removeItem("form.contact.name");
      window.localStorage?.removeItem("form.contact.email");
      window.localStorage?.removeItem("form.contact.content");
      router.push("/contact/success");
    } catch {
      trackEvent("contact_submit", { status: "error" });
      alert(t("contact.sendError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formRef.current && window?.localStorage) {
      const name = window.localStorage.getItem("form.contact.name");
      const email = window.localStorage.getItem("form.contact.email");
      const content = window.localStorage.getItem("form.contact.content");
      formRef.current.setValue("name", name || "");
      formRef.current.setValue("email", email || "");
      formRef.current.setValue("content", content || "");
      if (email) {
        formRef.current.trigger("email");
      }
    }
  }, []);

  return (
    <Card isBlurred className="m-12 relative p-8 max-w-xl mx-auto gap-8">
      <h2 className="text-2xl font-bold">{t("contact.title")}</h2>
      <FormHookWrapper<ContactForm>
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        ref={formRef}
      >
        {({ setValue, trigger }) => {
          const handleChangeValue =
            (name: "name" | "email" | "content") =>
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
            <div className="flex flex-col gap-4">
              <InputString
                name="name"
                rules={{
                  required: t("contact.nameRequired"),
                }}
                placeholder={t("contact.enterName")}
                label={t("contact.name")}
                onChange={handleChangeValue("name")}
                onClear={handleChangeValue("name")}
              />
              <InputString
                rules={{
                  required: t("contact.emailRequired"),
                  pattern: {
                    value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: t("contact.emailInvalid"),
                  },
                }}
                name="email"
                placeholder={t("contact.enterEmail")}
                label={t("contact.email")}
                type="email"
                onChange={handleChangeValue("email")}
                onClear={handleChangeValue("email")}
              />
              <InputTextarea
                rules={{
                  required: t("contact.contentRequired"),
                }}
                name="content"
                placeholder={t("contact.enterContent")}
                label={t("contact.content")}
                onChange={handleChangeValue("content")}
                onClear={handleChangeValue("content")}
              />
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
              <Button
                variant="solid"
                isLoading={isLoading}
                color="warning"
                type="submit"
              >
                {t("contact.submit")}
              </Button>
            </div>
          );
        }}
      </FormHookWrapper>
    </Card>
  );
};

export default Contact;
