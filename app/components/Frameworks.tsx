import { Card } from "@nextui-org/react";
import React from "react";
import {
  DiNodejsSmall,
  DiReact,
  DiBootstrap,
  DiAngularSimple,
} from "react-icons/di";
import { SiNextdotjs, SiTailwindcss, SiVuedotjs } from "react-icons/si";

export interface FrameworksProps {}

const Frameworks: React.FC<FrameworksProps> = () => {
  return (
    <Card
      isBlurred
      className="flex flex-1 items-center justify-center gap-4 p-8"
    >
      <h2 className="text-xl font-bold">Frameworks & libraries</h2>
      <div className="flex gap-2 flex-wrap items-center justify-center text-4xl">
        <DiReact />
        <DiNodejsSmall />
        <SiNextdotjs />
        <SiTailwindcss />
        <DiBootstrap />
        <SiVuedotjs />
        <DiAngularSimple />
      </div>
      <p className="text-center">
        ReactJS, NodeJS, NextJS, Tailwind, Bootstrap, VueJS, Angular
      </p>
    </Card>
  );
};

export default Frameworks;
