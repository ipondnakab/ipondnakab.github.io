"use client";

import { Avatar, Card } from "@nextui-org/react";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";

import CodingLanguages from "@/components/readme/CodingLanguages";
import Educations from "@/components/readme/Educations";
import Frameworks from "@/components/readme/Frameworks";
import OtherSkills from "@/components/readme/OtherSkills";
import OutsourceProjects from "@/components/readme/OutsourceProjects";
import WorkExperiences from "@/components/readme/WorkExperiences";

export interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col p-2 gap-4 sm:gap-8 sm:p-8">
      <Card
        isBlurred
        className="w-full flex items-center md:flex-row justify-center gap-8  p-8 h-full"
      >
        <div className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]">
          <Avatar
            className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]"
            src="./images/profile2.jpg"
          />
        </div>
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

export default Home;
