"use client";

import { Button, Card } from "@nextui-org/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { MdDoneAll } from "react-icons/md";

const ContactSendSuccess = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center flex-col gap-2 justify-center w-full h-[calc(100vh-4rem)] p-4">
      <Card isBlurred className="p-4 items-center justify-center py-8">
        <MdDoneAll className="text-9xl mb-4" />
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">{t("contact.successTitle")}</h2>
          <p className=" border-l border-gray-400 py-3 pl-4 pr-0">
            {t("contact.successMessage")}
          </p>
        </div>
        <Link href="/contact" className="w-full">
          <Button
            color="warning"
            className="px-4 w-full mt-4 items-center justify-center py-2"
          >
            {t("contact.sendAgain")}
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default ContactSendSuccess;
