"use client";

import { CardBody } from "@nextui-org/react";
import { motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";

import { SKILL_CATEGORIES } from "@/constants/resume-skills";

import MotionCard from "./MotionCard";
import { slideIn, staggerParent } from "./motion";

export interface SkillsPanelProps {}

// Chapter 4 — behind view, thin rings wrapping the character. This legend reads
// the orbiting rings as clean categories.
const SkillsPanel: React.FC<SkillsPanelProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="absolute left-4 top-20 bottom-16 w-[min(90vw,380px)] sm:left-12">
      <MotionCard
        isBlurred
        variants={slideIn(-70, 0)}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="h-full border border-foreground/10"
      >
        <CardBody className="flex h-full min-h-0 flex-col overflow-hidden p-6 sm:p-8">
          <div className="mb-1 text-[11px] uppercase tracking-[0.4em] text-foreground/40">
            {t("resume.chapter.skills", "Skills")}
          </div>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {t("resume.heading.skills", "Capabilities")}
          </h2>

          <motion.div
            variants={staggerParent}
            className="resume-scroll pointer-events-auto min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
          >
            {SKILL_CATEGORIES.map((category) => (
              <motion.div key={category.id} variants={slideIn(20, 0)}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: category.color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {t(`resume.skillCategory.${category.id}`, category.title)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-3.5">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-foreground/10 px-2 py-0.5 text-[11px] text-foreground/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardBody>
      </MotionCard>
    </div>
  );
};

export default SkillsPanel;
