"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface OtherSkillsProps {}

const OtherSkills: React.FC<OtherSkillsProps> = () => {
  const { t } = useTranslation();
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">{t("home.otherSkillsTitle")}</h2>
      <p className="text-center">{t("home.otherSkillsList")}</p>
    </Card>
  );
};

export default OtherSkills;
