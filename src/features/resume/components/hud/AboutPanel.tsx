"use client";

import { CardBody } from "@nextui-org/react";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";

import MotionCard from "./MotionCard";
import { slideIn } from "./motion";

export interface AboutPanelProps {}

// Chapter 2 — closer, angled view. A quiet "About" card beside the character.
const AboutPanel: React.FC<AboutPanelProps> = () => {
  const { t } = useTranslation();
  const years = dayjs().diff(dayjs("2021-05-01"), "year").toString();

  return (
    <div className="absolute right-4 top-1/2 w-[min(90vw,400px)] -translate-y-1/2 sm:right-12">
      <MotionCard
        isBlurred
        variants={slideIn(60, 0)}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="border border-foreground/10"
      >
        <CardBody className="p-6 sm:p-8">
          <div className="mb-3 text-[11px] uppercase tracking-[0.4em] text-foreground/40">
            {t("resume.chapter.about", "About")}
          </div>
          <p className="text-sm leading-relaxed text-foreground/75">
            {t("home.bio", { years })}
          </p>
          <div className="mt-6 border-t border-foreground/10 pt-5">
            <div className="mb-1.5 text-[11px] uppercase tracking-[0.3em] text-foreground/40">
              {t("home.educationsTitle", "Education")}
            </div>
            <p className="text-sm text-foreground/75">
              {t("home.educationsContent")}
            </p>
          </div>
        </CardBody>
      </MotionCard>
    </div>
  );
};

export default AboutPanel;
