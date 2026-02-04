import React, { Suspense } from "react";
import ThreeScene from "../components/ThreeScene";

const ThreeJSPage: React.FC = () => {
  return (
    <Suspense>
      <ThreeScene />
    </Suspense>
  );
};

export default ThreeJSPage;
