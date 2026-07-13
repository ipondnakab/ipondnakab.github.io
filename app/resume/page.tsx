import type { Metadata } from "next";
import { Suspense } from "react";

import ResumeExperience from "@/components/resume/ResumeExperience";

const DESCRIPTION =
  "Explore Kittipat Daengdee — a full-stack software engineer — through an interactive 3D résumé: experience, skills and projects in a cinematic hologram.";

export const metadata: Metadata = {
  title: "Interactive 3D Résumé",
  description: DESCRIPTION,
  keywords: [
    "Kittipat Daengdee resume",
    "Kittipat Daengdee CV",
    "full stack engineer resume",
    "software engineer portfolio",
    "3D resume",
    "interactive resume",
  ],
  alternates: { canonical: "/resume" },
  openGraph: {
    type: "profile",
    url: "/resume",
    title: "Kittipat Daengdee — Interactive 3D Résumé",
    description: DESCRIPTION,
    images: ["/images/profile2.jpg"],
  },
};

const ResumePage = () => {
  return (
    <Suspense fallback={null}>
      <ResumeExperience />
    </Suspense>
  );
};

export default ResumePage;
