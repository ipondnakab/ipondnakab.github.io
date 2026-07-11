"use client";

import { CardBody } from "@nextui-org/react";
import { motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";

import { WORK_EXPERIENCES } from "@/constants/work-experiences";
import { localize } from "@/functions/localize";

import MotionCard from "./MotionCard";
import { slideIn, staggerParent } from "./motion";

export interface ExperiencePanelProps {}

// Chapter 3 — side view. A clean career timeline beside the character.
const ExperiencePanel: React.FC<ExperiencePanelProps> = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="absolute right-4 top-20 bottom-16 w-[min(92vw,430px)] sm:right-12">
      <MotionCard
        isBlurred
        variants={slideIn(70, 0)}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="h-full border border-foreground/10"
      >
        <CardBody className="flex h-full min-h-0 flex-col overflow-hidden p-6 sm:p-8">
          <div className="mb-1 text-[11px] uppercase tracking-[0.4em] text-foreground/40">
            {t("resume.chapter.experience", "Journey")}
          </div>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {t("resume.heading.experience", "Experience")}
          </h2>

          <motion.ol
            variants={staggerParent}
            className="resume-scroll pointer-events-auto relative min-h-0 flex-1 space-y-6 overflow-y-auto pl-6 pr-1"
          >
            <span
              aria-hidden
              className="absolute bottom-1 left-[4px] top-1 w-px bg-foreground/12"
            />
            {WORK_EXPERIENCES.map((exp, i) => (
              <motion.li
                key={exp.title.en + i}
                variants={slideIn(24, 0)}
                className="relative"
              >
                <span
                  aria-hidden
                  className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-foreground/60"
                />
                <h3 className="text-sm font-medium text-foreground">
                  {localize(exp.title, lang)}
                </h3>
                {exp.position && (
                  <span className="mt-1 inline-block rounded-full border border-foreground/15 px-2 py-0.5 text-[11px] text-foreground/60">
                    {exp.position}
                  </span>
                )}
                {exp.description && (
                  <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                    {localize(exp.description, lang)}
                  </p>
                )}
                {exp.projects && exp.projects.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.projects.map((project, pi) => (
                      <li
                        key={project.title + pi}
                        className="text-xs text-foreground/45"
                      >
                        <span className="text-foreground/70">
                          {project.title}
                        </span>
                        {" — "}
                        {Array.isArray(project.description)
                          ? project.description
                              .map((d) => localize(d, lang))
                              .join(" ")
                          : localize(project.description, lang)}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
          </motion.ol>
        </CardBody>
      </MotionCard>
    </div>
  );
};

export default ExperiencePanel;
