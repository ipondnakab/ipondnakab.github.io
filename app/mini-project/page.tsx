"use client";

import { MINI_PROJECTS } from "@/constants/mini-project";
import { localize } from "@/functions/localize";
import { trackEvent } from "@/libs/analytics";
import { Button, Card, Link } from "@nextui-org/react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { HiArrowRight } from "react-icons/hi";

const MiniProjectPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 sm:p-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {t("miniProject.title")}
        </h1>
        <p className="max-w-2xl text-default-600">
          {t("miniProject.subtitle")}
        </p>
      </div>

      {MINI_PROJECTS.map((project, index) => {
        return (
          <Card
            key={project.name}
            isBlurred
            className={clsx(
              "group relative shrink-0 snap-start overflow-hidden p-8",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
            />

            <div className="relative flex h-full flex-col gap-5">
              <div className="flex items-center gap-4">
                {project.icon && (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-large bg-primary/10 text-3xl text-primary">
                    <project.icon />
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="text-tiny uppercase tracking-[0.25em] text-default-400">
                    {String(index + 1).padStart(2, "0")}
                    <span className="text-default-300">
                      {" / "}
                      {String(MINI_PROJECTS.length).padStart(2, "0")}
                    </span>
                  </span>
                  <h2 className="text-xl font-bold leading-tight sm:text-2xl">
                    {project.title}
                  </h2>
                </div>
              </div>

              <p className="flex-1 text-small leading-relaxed text-default-600">
                {localize(project.description, lang)}
              </p>

              <Button
                as={Link}
                href={project.href}
                color="primary"
                variant="flat"
                endContent={
                  <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                }
                className="w-fit font-semibold"
                onPress={() =>
                  trackEvent("mini_project_click", {
                    project: project.title,
                    href: project.href,
                  })
                }
              >
                {t("miniProject.open")}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MiniProjectPage;
