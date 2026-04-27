import PlanningPoker from "@/components/planning-poker/PlanningPoker";
import React, { Suspense } from "react";

const PlanningPokerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanningPoker />
    </Suspense>
  );
};

export default PlanningPokerPage;
