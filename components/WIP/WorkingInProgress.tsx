import { Card } from "@nextui-org/react";
import React from "react";
import { IoCodeWorking } from "react-icons/io5";

const WorkingInProgress: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)] p-4">
      <Card isBlurred className="px-16 items-center justify-center py-8">
        <IoCodeWorking className="text-9xl mb-4" />
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">WIP</h2>
          <p className=" border-l border-gray-400 py-3 pl-4 pr-0">
            Work in progress.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WorkingInProgress;
