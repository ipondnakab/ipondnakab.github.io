import { OUTSOURCE_PROJECTS } from "@/constants/outsource-projects";
import { Card, Chip } from "@nextui-org/react";
import React from "react";
import { IoLinkSharp } from "react-icons/io5";

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
      {OUTSOURCE_PROJECTS.map((project, index) => (
        <div key={project.title + index} className="flex flex-col">
          <Chip className="line-clamp-2 ">
            <div className="flex gap-2 items-center">
              <span>{project.title}</span>
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IoLinkSharp />
                </a>
              )}
            </div>
          </Chip>
          {typeof project.description === "string" ? (
            <p className="ml-4 pl-2 border-l-2 border-default py-2 mb-2">
              {project.description}
            </p>
          ) : (
            <ul className="ml-4 border-l-2 border-default py-2 mb-2 list-disc pl-6">
              {project.description.map((desc, descIndex) => (
                <li key={descIndex}>{desc}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </Card>
  );
};

export default OutsourceProjects;
