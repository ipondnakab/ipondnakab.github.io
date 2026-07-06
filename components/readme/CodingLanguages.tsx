"use client";

import { Card } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { DiJava } from "react-icons/di";
import { FaGolang } from "react-icons/fa6";
import {
  SiCplusplus,
  SiCss3,
  SiHtml5,
  SiJavascript,
  SiPython,
  SiTypescript,
} from "react-icons/si";

export interface CodingLanguagesProps {}

const CodingLanguages: React.FC<CodingLanguagesProps> = () => {
  const { t } = useTranslation();
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">{t("home.codingTitle")}</h2>
      <div className="flex gap-2 flex-wrap items-center justify-center text-4xl">
        <SiTypescript />
        <SiJavascript />
        <SiHtml5 />
        <SiCss3 />
        <DiJava />
        <SiPython />
        <SiCplusplus />
        <FaGolang className="text-6xl" />
      </div>
      <p className="text-center">
        Typescript, JavaScript, HTML, CSS, JAVA, Python, C++, Go
      </p>
    </Card>
  );
};

export default CodingLanguages;
