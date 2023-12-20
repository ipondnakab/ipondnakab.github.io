import React from "react";
import { Avatar, Card } from "@nextui-org/react";
import dayjs from "dayjs";
import WorkExperiences from "./components/WorkExperiences";
import Educations from "./components/Educations";
import Frameworks from "./components/Frameworks";
import CodingLanguages from "./components/CodingLanguages";
import OutsourceProjects from "./components/OutsourceProjects";
import { lineNotify } from "./services/line";

export interface HomeProps {}

async function sendLineNotify() {
  await lineNotify({
    message: "Some One Visit Your Resume",
  });
}

const Home: React.FC<HomeProps> = async () => {
  try {
    await sendLineNotify();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error });
  }
  return (
    <div className="flex flex-col p-2 gap-4 sm:gap-8 sm:p-8">
      <Card
        isBlurred
        className="w-full flex items-center md:flex-row justify-center gap-8  p-8 h-full"
      >
        <div className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]">
          <Avatar
            className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]"
            src="./images/profile.jpg"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm">Hello I’m</span>
          <h1 className="text-xl sm:text-4xl font-bold">Kittipat Daengdee</h1>
          <span className="text-sm mt-2 max-w-lg">
            I’m a software engineer with{" "}
            {dayjs().diff(dayjs("01-05-2021"), "y").toString()}+ years of
            experience in full-stack web and application development and
            automated test. I use a creative approach to problem-solving. I’m
            good at collaboration and eager to learn new skills.
          </span>
        </div>
      </Card>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        <Frameworks />
        <CodingLanguages />
      </div>
      <Educations />
      <WorkExperiences />
      <OutsourceProjects />
    </div>
  );
};

export default Home;
