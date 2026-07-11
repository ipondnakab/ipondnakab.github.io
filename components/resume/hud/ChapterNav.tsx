"use client";

import { Button, Card } from "@nextui-org/react";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiArrowLeft, HiChevronLeft, HiChevronRight } from "react-icons/hi";

import LanguageSwitcher from "@/components/layouts/LanguageSwitcher";
import { ResumeChapter } from "@/interfaces/resume";

export interface ChapterNavProps {
  chapters: ResumeChapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

// Transparent, blurred floating nav. On desktop it shows chapter pills; on
// mobile a compact ‹ [Section] › stepper. Selecting jumps the camera via a
// smooth scroll — no page reload.
const ChapterNav: React.FC<ChapterNavProps> = ({
  chapters,
  activeIndex,
  onSelect,
}) => {
  const { t } = useTranslation();
  const lastIndex = chapters.length - 1;
  const activeChapter = chapters[activeIndex] ?? chapters[0];
  const chapterLabel = (chapter: ResumeChapter) =>
    t(`resume.chapter.${chapter.id}`, chapter.label);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
      <Button
        as={Link}
        href="/"
        isIconOnly
        radius="full"
        size="sm"
        variant="flat"
        aria-label={t("resume.nav.home", "Home")}
        className="pointer-events-auto"
      >
        <HiArrowLeft />
      </Button>

      {/* Desktop: chapter pills */}
      <Card
        isBlurred
        className="pointer-events-auto hidden rounded-full border border-foreground/10 md:block"
      >
        <nav
          className="pointer-events-auto hidden items-center gap-1 rounded-full px-2 py-1.5 md:flex"
          aria-label={t("resume.nav.chapters", "Chapters")}
        >
          {chapters.map((chapter) => {
            const active = chapter.index === activeIndex;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onSelect(chapter.index)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors text-foreground-500 hover:text-foreground-800 hover:font-semibold",
                  active ? "text-primary" : undefined,
                )}
              >
                {chapterLabel(chapter)}
              </button>
            );
          })}
          <div className="pointer-events-auto hidden rounded-full px-3 py-1.5 text-xs tracking-[0.25em] md:block">
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="text-foreground/35">
              {" / "}
              {String(chapters.length).padStart(2, "0")}
            </span>
          </div>
        </nav>
      </Card>

      {/* Mobile: ‹ [Section] › stepper */}
      <Card
        isBlurred
        className="pointer-events-auto flex items-center gap-1 flex-row rounded-full border border-foreground/10 px-1.5 py-1 md:hidden"
        aria-label={t("resume.nav.chapters", "Chapters")}
      >
        <button
          type="button"
          onClick={() => onSelect(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          aria-label="Previous section"
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:text-foreground disabled:opacity-25"
        >
          <HiChevronLeft />
        </button>
        <span className="min-w-[5.5rem] text-center text-xs font-medium tracking-wide ">
          {chapterLabel(activeChapter)}
        </span>
        <button
          type="button"
          onClick={() => onSelect(Math.min(lastIndex, activeIndex + 1))}
          disabled={activeIndex === lastIndex}
          aria-label="Next section"
          className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/75 transition-colors hover:text-foreground disabled:opacity-25"
        >
          <HiChevronRight />
        </button>
      </Card>

      <div className="pointer-events-auto flex items-center gap-2">
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default ChapterNav;
