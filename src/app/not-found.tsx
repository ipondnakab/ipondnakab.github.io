"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface NotFoundPageProps {}

const NotFoundPage: React.FC<NotFoundPageProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)] p-4">
      <Card isBlurred className="p-4 py-8">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">{t("notFound.title")}</h2>
          <p className=" border-l border-gray-400 py-3 pl-4 pr-0">
            {t("notFound.message")}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
