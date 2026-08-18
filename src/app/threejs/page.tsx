import React, { Suspense } from "react";

import ThreeScene from "@/features/threejs/components/ThreeScene";

const ThreeJSPage: React.FC = () => {
  return (
    <Suspense>
      <ThreeScene />
    </Suspense>
  );
};

export default ThreeJSPage;
