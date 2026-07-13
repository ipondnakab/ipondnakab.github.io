import { Suspense } from "react";

import PlanningPoker from "@/components/planning-poker/PlanningPoker";

export const metadata = {
  title: "Agile Planning Estimation",
  description:
    "Real-time Planning Poker for agile teams to estimate story points together.",
};

const PlanningPokerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanningPoker />
    </Suspense>
  );
};

export default PlanningPokerPage;
