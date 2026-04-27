import { MINI_PROJECTS } from "@/constants/mini-ptoject";
import { Card, Divider } from "@nextui-org/react";
import React from "react";

const MiniProjectPage = () => {
  return (
    <div className="p-8 flex flex-col mx-auto gap-8">
      <Card isBlurred className="flex flex-col gap-4 p-8">
        <h1 className="text-4xl font-bold">Mini Projects</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          A collection of mini projects showcasing my skills and creativity.
        </p>
        <Divider className="w-full" />
        {MINI_PROJECTS.map((project, index) => [
          <a
            key={project.title + index}
            href={project.href}
            className="hover:bg-primary rounded-md px-0 hover:px-4 transition-all duration-300 py-2 cursor-pointer"
            rel="noopener noreferrer"
          >
            <h2 className="text-2xl font-bold">{project.title}</h2>
            <p className="">{project.description}</p>
          </a>,
          index < MINI_PROJECTS.length - 1 && (
            <Divider key={"divider-" + index} className="w-full" />
          ),
        ])}
      </Card>
    </div>
  );
};

export default MiniProjectPage;
