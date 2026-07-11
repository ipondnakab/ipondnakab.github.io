"use client";

import {
  Button,
  CardBody,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiArrowUpRight } from "react-icons/hi2";

import { OUTSOURCE_PROJECTS } from "@/constants/outsource-projects";
import { localize } from "@/functions/localize";
import { ProjectExperience } from "@/interfaces/work-experience";

import MotionCard from "./MotionCard";
import { slideIn, staggerParent } from "./motion";

export interface ProjectsPanelProps {}

const descriptionLines = (
  project: ProjectExperience,
  lang: string,
): string[] => {
  const { description } = project;
  return Array.isArray(description)
    ? description.map((d) => localize(d, lang))
    : [localize(description, lang)];
};

// Chapter 5 — projects appear as floating hologram windows. Hover enlarges a
// window; clicking opens a full readout.
const ProjectsPanel: React.FC<ProjectsPanelProps> = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [active, setActive] = useState<ProjectExperience | null>(null);

  const openProject = (project: ProjectExperience) => {
    setActive(project);
    onOpen();
  };

  return (
    <>
      <div className="absolute left-4 top-20 bottom-16 w-[min(92vw,460px)] sm:left-12">
        <MotionCard
          isBlurred
          variants={slideIn(-90, 0)}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="h-full border border-foreground/10"
        >
          <CardBody className="flex h-full min-h-0 flex-col overflow-hidden p-6 sm:p-8">
            <div className="mb-1 text-[11px] uppercase tracking-[0.4em] text-foreground/40">
              {t("resume.chapter.projects", "Work")}
            </div>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
              {t("resume.heading.projects", "Projects")}
            </h2>

            <motion.div
              variants={staggerParent}
              className="resume-scroll pointer-events-auto grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2"
            >
              {OUTSOURCE_PROJECTS.map((project) => (
                <motion.button
                  key={project.title}
                  type="button"
                  variants={slideIn(0, 20)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => openProject(project)}
                  className="group pointer-events-auto flex flex-col rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-foreground/25 hover:bg-foreground/[0.06]"
                >
                  <span className="text-sm font-medium text-foreground">
                    {project.title}
                  </span>
                  <span className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/55">
                    {descriptionLines(project, lang)[0]}
                  </span>
                  <span className="mt-auto pt-3 text-[11px] uppercase tracking-widest text-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {t("resume.action.view", "View")} →
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </CardBody>
        </MotionCard>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="center"
        classNames={{
          base: "border border-foreground/10",
          wrapper: "z-[60]",
          backdrop: "z-[60]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {active?.title}
              </ModalHeader>
              <ModalBody className="pb-2">
                <ul className="space-y-2 text-sm text-foreground/80">
                  {active &&
                    descriptionLines(active, lang).map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-foreground/40">▹</span>
                        <span>{line}</span>
                      </li>
                    ))}
                </ul>
              </ModalBody>
              <ModalFooter>
                {active?.projectUrl && (
                  <Button
                    as={Link}
                    href={active.projectUrl}
                    target="_blank"
                    color="primary"
                    variant="flat"
                    endContent={<HiArrowUpRight />}
                  >
                    {t("resume.action.visit", "Visit")}
                  </Button>
                )}
                <Button variant="light" onPress={onClose}>
                  {t("resume.action.close", "Close")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectsPanel;
