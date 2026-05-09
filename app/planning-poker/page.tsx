import React, { Suspense } from "react";

import PlanningPoker from "@/components/planning-poker/PlanningPoker";

export const metadata = {
  title: "Agile Planning Estimation",
  description: "Agile Planning Estimation with Planning Poker",
};

const PlanningPokerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanningPoker />
    </Suspense>
  );
};

export default PlanningPokerPage;
