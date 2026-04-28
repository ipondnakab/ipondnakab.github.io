import PlanningPoker from "@/components/planning-poker/PlanningPoker";
import React, { Suspense } from "react";

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
