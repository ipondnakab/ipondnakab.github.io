import { Suspense } from "react";

import ResumeExperience from "@/components/resume/ResumeExperience";

export const metadata = {
  title: "Immersive Résumé",
  description:
    "Step into a cinematic control room and explore Kittipat Daengdee through an interactive 3D hologram — experience, skills, projects and more.",
};

const ResumePage = () => {
  return (
    <Suspense fallback={null}>
      <ResumeExperience />
    </Suspense>
  );
};

export default ResumePage;
