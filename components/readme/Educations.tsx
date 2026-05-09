import { Card } from "@nextui-org/react";
import React from "react";

export interface EducationsProps {}

const Educations: React.FC<EducationsProps> = () => {
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">Educations</h2>
      <p className="text-center">
        Bachelor of Computer Engineering Khon Kaen University ( 2018 - 2022)
      </p>
    </Card>
  );
};

export default Educations;
