import type { Metadata } from "next";
import { Suspense } from "react";

import PlanningPoker from "@/components/planning-poker/PlanningPoker";
import PlanningPokerSeo from "@/components/planning-poker/PlanningPokerSeo";
import PlanningPokerSeoGate from "@/components/planning-poker/PlanningPokerSeoGate";

const TITLE =
  "Free Online Planning Point Estimation — Scrum estimation point for Agile Teams";
const DESCRIPTION =
  "Free online Planning Point Estimation (Scrum estimation point) for agile teams. Estimate story points in real time with custom decks, team groups and shared round history — no sign-up, no install.";
const OG_IMAGE = {
  url: "/images/og-planning.png",
  width: 1672,
  height: 941,
  alt: "Planning Point Estimation — free real-time Scrum estimation point for agile teams",
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "planning point Estimation",
    "scrum poker",
    "online planning point Estimation",
    "free planning point Estimation",
    "planning point Estimation online free",
    "story point estimation",
    "agile estimation tool",
    "pointing poker",
    "sprint planning point Estimation",
    "fibonacci estimation",
    "scrum estimation tool",
  ],
  alternates: { canonical: "/planning" },
  openGraph: {
    type: "website",
    url: "/planning",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const PlanningPokerPage = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PlanningPoker />
      </Suspense>
      <PlanningPokerSeoGate>
        <PlanningPokerSeo />
      </PlanningPokerSeoGate>
    </>
  );
};

export default PlanningPokerPage;
