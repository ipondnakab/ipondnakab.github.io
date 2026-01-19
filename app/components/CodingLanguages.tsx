import { Card } from "@nextui-org/react";
import React from "react";
import {
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss3,
  SiPython,
  SiCplusplus,
} from "react-icons/si";
import { DiJava } from "react-icons/di";
import { FaGolang } from "react-icons/fa6";

export interface CodingLanguagesProps {}

const CodingLanguages: React.FC<CodingLanguagesProps> = () => {
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">Coding Languages</h2>
      <div className="flex gap-2 flex-wrap items-center justify-center text-4xl">
        <SiTypescript />
        <SiJavascript />
        <SiHtml5 />
        <SiCss3 />
        <DiJava />
        <SiPython />
        <SiCplusplus />
        <FaGolang className="text-6xl" />
      </div>
      <p className="text-center">
        Typescript, JavaScript, HTML, CSS, JAVA, Python, C++, Go
      </p>
    </Card>
  );
};

export default CodingLanguages;
