"use client";

import { Card, Chip } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoLinkSharp } from "react-icons/io5";

import { OUTSOURCE_PROJECTS } from "@/constants/outsource-projects";
import { localize } from "@/functions/localize";

export interface OutsourceProjectsProps {}

const OutsourceProjects: React.FC<OutsourceProjectsProps> = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <Card
      isBlurred
      className="flex flex-1 items-start justify-start gap-4 p-4 sm:p-8"
    >
      <h2 className="text-xl font-bold">{t("home.outsourceTitle")}</h2>
      {OUTSOURCE_PROJECTS.map((project, index) => (
        <div key={project.title + index} className="flex flex-col">
          <Chip className="line-clamp-2 ">
            <div className="flex gap-2 items-center">
              <span>{project.title}</span>
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IoLinkSharp />
                </a>
              )}
            </div>
          </Chip>
          {Array.isArray(project.description) ? (
            <ul className="ml-4 border-l-2 border-default py-2 mb-2 list-disc pl-6">
              {project.description.map((desc, descIndex) => (
                <li key={descIndex}>{localize(desc, lang)}</li>
              ))}
            </ul>
          ) : (
            <p className="ml-4 pl-2 border-l-2 border-default py-2 mb-2">
              {localize(project.description, lang)}
            </p>
          )}
        </div>
      ))}
    </Card>
  );
};

export default OutsourceProjects;
