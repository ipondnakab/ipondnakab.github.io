import React, { Suspense } from "react";

import ThreeScene from "@/components/threejs/ThreeScene";

const ThreeJSPage: React.FC = () => {
  return (
    <Suspense>
      <ThreeScene />
    </Suspense>
  );
};

export default ThreeJSPage;
