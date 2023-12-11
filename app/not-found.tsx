import { Divider } from "@nextui-org/react";
import React from "react";

export interface NotFoundPageProps {}

const NotFoundPage: React.FC<NotFoundPageProps> = () => {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)]">
      <div className="flex h-12 items-center justify-center gap-4">
        <h2 className="text-2xl font-medium">404</h2>
        <Divider orientation="vertical" />
        <span>This page could not be found.</span>
      </div>
    </div>
  );
};

export default NotFoundPage;
