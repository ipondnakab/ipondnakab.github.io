"use client";

import { motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";

import { slideIn, staggerParent } from "./motion";

export interface HeroPanelProps {}

// Chapter 1 — front view. Name, title and greeting, set in clean type.
const HeroPanel: React.FC<HeroPanelProps> = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute gap-2 inset-x-0 bottom-16 flex flex-col items-center px-6 text-center"
    >
      <motion.span
        variants={slideIn(0, 20)}
        className="text-xs uppercase tracking-[0.5em] text-foreground/45"
      >
        {t("home.greeting", "Hello I'm")}
      </motion.span>

      <motion.h1
        variants={slideIn(0, 26)}
        className="text-4xl font-semibold leading-none tracking-tight text-foreground sm:text-6xl"
      >
        {t("kittipat.dangdee", "Kittipat Daengdee")}
      </motion.h1>

      <motion.div
        variants={slideIn(0, 20)}
        className="text-xs uppercase tracking-[0.4em] text-foreground/55 sm:text-sm"
      >
        {t("resume.title", "Full-Stack Software Engineer")}
      </motion.div>
    </motion.div>
  );
};

export default HeroPanel;
