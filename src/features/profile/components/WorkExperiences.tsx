"use client";

import { Avatar, Card, Chip } from "@nextui-org/react";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";

import { WORK_EXPERIENCES } from "@/constants/work-experiences";
import { localize } from "@/functions/localize";

export interface WorkExperiencesProps {}

const WorkExperiences: React.FC<WorkExperiencesProps> = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <Card
      isBlurred
      className="flex flex-1 items-start justify-start p-4 sm:p-8"
    >
      <h2 className="text-xl font-bold">{t("home.workTitle")}</h2>
      {WORK_EXPERIENCES.map((workExperience, index) => (
        <div key={workExperience.title.en + index}>
          <div className="flex gap-2 items-center">
            <div className="w-14">
              <Avatar
                size="lg"
                className="shadow-sm"
                src={
                  workExperience.urlImage.length < 10
                    ? undefined
                    : workExperience.urlImage
                }
                name={workExperience.urlImage}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg">
                {localize(workExperience.title, lang)}
              </h3>
              <Chip size="sm">{workExperience.position}</Chip>
            </div>
          </div>
          {workExperience.description && (
            <div className="flex ml-7 gap-4 border-l-2 py-3 pl-4">
              {localize(workExperience.description, lang)}
            </div>
          )}
          {workExperience.projects?.map((project, index) => (
            <div
              className={clsx(
                "flex ml-7 gap-4 border-l-2 py-2 pl-4",
                workExperience.projects &&
                  index === workExperience.projects.length - 1 &&
                  "pb-6",
              )}
              key={(project.team || "") + index}
            >
              <div className="w-10">
                <Avatar
                  src={
                    project.urlImage && project.urlImage.length > 10
                      ? project.urlImage
                      : undefined
                  }
                  className="text-xl text-black bg-white shadow-sm"
                  name={project.urlImage}
                />
              </div>
              <p className="mt-1">
                {Array.isArray(project.description)
                  ? project.description
                      .map((desc) => localize(desc, lang))
                      .join(" ")
                  : localize(project.description, lang)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
};

export default WorkExperiences;
