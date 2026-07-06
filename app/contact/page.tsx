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
import { ContactForm } from "@/interfaces/contact";

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

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Send to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/contact/success");
    } catch {
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
