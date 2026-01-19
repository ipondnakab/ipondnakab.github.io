import { Card } from "@nextui-org/react";
import React from "react";

export interface OtherSkillsProps {}

const OtherSkills: React.FC<OtherSkillsProps> = () => {
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">Other Skills</h2>
      <p className="text-center">
        Git, Docker, Jenkins, SQL, LINE API, HTML, CSS, SCSS, English
        (intermediate)
      </p>
    </Card>
  );
};

export default OtherSkills;
