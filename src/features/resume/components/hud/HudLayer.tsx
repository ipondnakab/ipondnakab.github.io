"use client";

import { AnimatePresence } from "framer-motion";
import React from "react";

import { ResumeChapterId } from "@/interfaces/resume";

import AboutPanel from "./AboutPanel";
import ContactPanel from "./ContactPanel";
import ExperiencePanel from "./ExperiencePanel";
import HeroPanel from "./HeroPanel";
import ProjectsPanel from "./ProjectsPanel";
import SkillsPanel from "./SkillsPanel";

export interface HudLayerProps {
  activeIndex: number;
}

// The per-chapter card is keyed by chapter id so AnimatePresence eases the old
// panel out and the new one in as the camera settles into each waypoint.
const PANELS: Record<ResumeChapterId, React.FC> = {
  intro: HeroPanel,
  about: AboutPanel,
  experience: ExperiencePanel,
  skills: SkillsPanel,
  projects: ProjectsPanel,
  contact: ContactPanel,
};

const ORDER: ResumeChapterId[] = [
  "intro",
  "about",
  "experience",
  "skills",
  "projects",
  "contact",
];

const HudLayer: React.FC<HudLayerProps> = ({ activeIndex }) => {
  const id = ORDER[Math.min(Math.max(activeIndex, 0), ORDER.length - 1)];
  const Panel = PANELS[id];

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <AnimatePresence mode="wait">
        <Panel key={id} />
      </AnimatePresence>
    </div>
  );
};

export default HudLayer;
