"use client";

import { Card } from "@nextui-org/react";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";

import CodingLanguages from "@/features/profile/components/CodingLanguages";
import Educations from "@/features/profile/components/Educations";
import Frameworks from "@/features/profile/components/Frameworks";
import OtherSkills from "@/features/profile/components/OtherSkills";
import OutsourceProjects from "@/features/profile/components/OutsourceProjects";
import ProfileAvatar from "@/features/profile/components/ProfileAvatar";
import WorkExperiences from "@/features/profile/components/WorkExperiences";

export interface ProfileReadmeProps {}

const ProfileReadme: React.FC<ProfileReadmeProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col p-2 gap-4 sm:gap-8 sm:p-8">
      <Card
        isBlurred
        className="w-full flex items-center md:flex-row justify-center gap-8  p-8 h-full"
      >
        <ProfileAvatar className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm">{t("home.greeting")}</span>
          <h1 className="text-xl sm:text-4xl font-bold">Kittipat Daengdee</h1>
          <span className="text-sm mt-2 max-w-lg">
            {t("home.bio", {
              years: dayjs().diff(dayjs("2021-05-01"), "year").toString(),
            })}
          </span>
        </div>
      </Card>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        <Frameworks />
        <CodingLanguages />
      </div>
      <OtherSkills />
      <Educations />
      <WorkExperiences />
      <OutsourceProjects />
    </div>
  );
};

export default ProfileReadme;
