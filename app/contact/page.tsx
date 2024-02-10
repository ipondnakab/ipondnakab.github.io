"use client";
import FormHookWrapper from "@/components/form-hook-wrapper/FormHookWrapper";
import InputString from "@/components/inputs/InputString";
import InputTextarea from "@/components/inputs/InputTextarea";
import { Button, Card } from "@nextui-org/react";
import React from "react";
import { useRouter } from "next/navigation";
import { ContactForm } from "@/interfaces/contact";
import { createContact } from "../services/contact";

export interface ContactProps {}

const Contact: React.FC<ContactProps> = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const onSubmit = async (values: ContactForm) => {
    setIsLoading(true);
    try {
      await createContact(values);
      router.push("/contact/success");
    } catch (error) {
      alert("Send message error please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultValues: ContactForm = {
    name: localStorage.getItem("form.contact.name") || "",
    email: localStorage.getItem("form.contact.email") || "",
    content: localStorage.getItem("form.contact.content") || "",
  };

  return (
    <Card isBlurred className="m-12 relative p-8 max-w-xl mx-auto gap-8">
      <h2 className="text-2xl font-bold">Send me a Message</h2>
      <FormHookWrapper<ContactForm>
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      >
        {({ setValue, trigger }) => {
          const handleChangeValue =
            (name: "name" | "email" | "content") =>
            (e?: React.ChangeEvent<HTMLInputElement>) => {
              localStorage.setItem(
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
                  required: "Name is required",
                }}
                placeholder="Enter Name"
                label="Name"
                onChange={handleChangeValue("name")}
                onClear={handleChangeValue("name")}
              />
              <InputString
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: "Entered value does not match email format",
                  },
                }}
                name="email"
                placeholder="Enter Email"
                label="Email"
                type="email"
                onChange={handleChangeValue("email")}
                onClear={handleChangeValue("email")}
              />
              <InputTextarea
                rules={{
                  required: "Content is required",
                }}
                name="content"
                placeholder="Enter Content"
                label="Content"
                onChange={handleChangeValue("content")}
                onClear={handleChangeValue("content")}
              />
              <Button
                variant="solid"
                isLoading={isLoading}
                color="warning"
                type="submit"
              >
                Submit
              </Button>
            </div>
          );
        }}
      </FormHookWrapper>
    </Card>
  );
};

export default Contact;
