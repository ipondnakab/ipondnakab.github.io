import { Avatar, Card } from "@nextui-org/react";
import dayjs from "dayjs";
import React from "react";

import CodingLanguages from "@/components/readme/CodingLanguages";
import Educations from "@/components/readme/Educations";
import Frameworks from "@/components/readme/Frameworks";
import OtherSkills from "@/components/readme/OtherSkills";
import OutsourceProjects from "@/components/readme/OutsourceProjects";
import WorkExperiences from "@/components/readme/WorkExperiences";

export interface HomeProps {}

const Home: React.FC<HomeProps> = async () => {
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
          <span className="text-sm">Hello I’m</span>
          <h1 className="text-xl sm:text-4xl font-bold">Kittipat Daengdee</h1>
          <span className="text-sm mt-2 max-w-lg">
            I am a software engineer with over{" "}
            {dayjs().diff(dayjs("01-05-2021"), "y").toString()}+ years of
            experience in full-stack web and application development, as well as
            automated testing. I apply a creative approach to problem-solving
            and excel in collaborative environments. I am also eager to
            continuously learn and develop new skills.
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
