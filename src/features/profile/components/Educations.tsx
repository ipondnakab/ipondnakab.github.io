"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface EducationsProps {}

const Educations: React.FC<EducationsProps> = () => {
  const { t } = useTranslation();
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">{t("home.educationsTitle")}</h2>
      <p className="text-center">{t("home.educationsContent")}</p>
    </Card>
  );
};

export default Educations;
