"use client";

import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  RESUME_CHAPTERS,
  RESUME_CHAPTER_COUNT,
} from "@/constants/resume-chapters";

import { useTheme } from "next-themes";
import ChapterNav from "./hud/ChapterNav";
import HudLayer from "./hud/HudLayer";
import ScrollHint from "./hud/ScrollHint";
import { SceneMood } from "./scene/CameraRig";

// The WebGL canvas can only run in the browser (no SSR for the static export).
const ResumeCanvas = dynamic(() => import("./ResumeCanvas"), { ssr: false });

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// The backdrop is styled via the `.resume-backdrop` CSS class (themed by the
// `.dark` class next-themes sets on <html>) — see app/globals.css. Driving it
// from CSS instead of a JS-computed inline style avoids a hydration flash.

// Minimal loading veil driven by drei's global asset progress.
const SceneLoader: React.FC = () => {
  const { t } = useTranslation();
  const { progress, active } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const id = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(id);
    }
  }, [active, progress]);

  if (done) return null;

  return (
    <div className="resume-backdrop absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4">
      <div className="text-[11px] uppercase tracking-[0.5em] text-foreground/50">
        {t("resume.loading", "Loading")}
      </div>
      <div className="h-px w-48 overflow-hidden bg-foreground/10">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export interface ResumeExperienceProps {}

// Orchestrates the whole cinematic résumé: a fixed fullscreen stage (3D + HUD)
// over a tall invisible scroll track. Scrolling advances a shared progress value
// that the camera timeline and HUD both read — the page never actually scrolls
// visually, it just moves the camera between chapters.
const ResumeExperience: React.FC<ResumeExperienceProps> = () => {
  // `resolvedTheme` collapses "system" to the real value; default to dark.
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const progressRef = useRef(0);
  const moodRef = useRef<SceneMood>({ key: RESUME_CHAPTERS[0].camera.key });
  const [activeIndex, setActiveIndex] = useState(0);

  // Detect low-power / reduced-motion once, to lighten the render (lower dpr).
  const lowPower = useMemo(() => {
    if (typeof window === "undefined") return false;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return isMobile || reduced;
  }, []);

  // Scroll → progress + active chapter.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      progressRef.current = clamp01(p);
      const idx = Math.round(progressRef.current * (RESUME_CHAPTER_COUNT - 1));
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Menu click → smoothly animate the scroll position (which moves the camera).
  const scrollToChapter = (index: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (index / (RESUME_CHAPTER_COUNT - 1)) * max;
    const obj = { y: window.scrollY };
    gsap.to(obj, {
      y: targetY,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => window.scrollTo(0, obj.y),
    });
  };

  return (
    <>
      <div className="resume-backdrop fixed inset-0 z-50 overflow-hidden">
        <ResumeCanvas
          progressRef={progressRef}
          moodRef={moodRef}
          isDark={isDark}
          highDpr={!lowPower}
        />
        <HudLayer activeIndex={activeIndex} />
        <ChapterNav
          chapters={RESUME_CHAPTERS}
          activeIndex={activeIndex}
          onSelect={scrollToChapter}
        />
        <ScrollHint visible={activeIndex === 0} />
        <SceneLoader />
      </div>

      {/* Invisible scroll track that gives the experience its scroll length. */}
      <div aria-hidden style={{ height: `${RESUME_CHAPTER_COUNT * 100}vh` }} />
    </>
  );
};

export default ResumeExperience;
