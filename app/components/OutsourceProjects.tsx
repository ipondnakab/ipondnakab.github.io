import { OUTSOURCE_PROJECTS } from "@/constants/outsource-projects";
import { Card, Chip } from "@nextui-org/react";
import React from "react";

export interface OutsourceProjectsProps {}

const OutsourceProjects: React.FC<OutsourceProjectsProps> = () => {
  return (
    <Card
      isBlurred
      className="flex flex-1 items-start justify-start gap-4 p-4 sm:p-8"
    >
      <h2 className="text-xl font-bold">
        Outsourcing Developer and Other experience
      </h2>
      {OUTSOURCE_PROJECTS.map((project) => (
        <div key={project.title} className="flex flex-col">
          <Chip className="line-clamp-2">{project.title}</Chip>
          <p className="ml-4 pl-2 border-l-2 border-default py-2 mb-2">
            {project.description}
          </p>
        </div>
      ))}
    </Card>
  );
};

export default OutsourceProjects;
