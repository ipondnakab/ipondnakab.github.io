"use client";
import FormHookWrapper from "@/components/form-hook-wrapper/FormHookWrapper";
import InputString from "@/components/inputs/InputString";
import InputTextarea from "@/components/inputs/InputTextarea";
import { Button, Card } from "@nextui-org/react";
import React from "react";
import { lineNotify } from "../services/line";
import { useRouter } from "next/navigation";

export interface ContactProps {}

const Contact: React.FC<ContactProps> = () => {
  const router = useRouter();
  const onSubmit = async (values: {
    name: string;
    email: string;
    content: string;
  }) => {
    try {
      await lineNotify({
        message: `.\n
        Name: ${values.name}\n
        Email: ${values.email}\n
        Content: \n${values.content}`,
        stickerPackageId: 6359,
        stickerId: 11069853,
      });
      router.push("/contact/success");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      alert("Send message error please try again");
    }
  };
  return (
    <Card isBlurred className="m-8 p-8 max-w-xl mx-auto gap-8">
      <h2 className="text-2xl font-bold">Send me a Message</h2>
      <FormHookWrapper<{ name: string; email: string; content: string }>
        defaultValues={{
          name: "",
          email: "",
          content: "",
        }}
        onSubmit={onSubmit}
      >
        {() => (
          <div className="flex flex-col gap-4">
            <InputString
              name="name"
              rules={{
                required: "Name is required",
              }}
              placeholder="Enter Name"
              label="Name"
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
            />
            <InputTextarea
              rules={{
                required: "Content is required",
              }}
              name="content"
              placeholder="Enter Content"
              label="Content"
            />
            <Button variant="solid" color="warning" type="submit">
              Submit
            </Button>
          </div>
        )}
      </FormHookWrapper>
    </Card>
  );
};

export default Contact;
