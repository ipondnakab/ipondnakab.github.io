import { Card } from "@nextui-org/react";
import React from "react";

export interface NotFoundPageProps {}

const NotFoundPage: React.FC<NotFoundPageProps> = () => {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)] p-4">
      <Card isBlurred className="p-4 py-8">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">404</h2>
          <p className=" border-l border-gray-400 py-3 pl-4 pr-0">
            This page could not be found.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
