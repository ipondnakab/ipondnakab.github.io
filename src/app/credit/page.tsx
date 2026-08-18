import type { Metadata } from "next";

import Credits from "@/features/credit/components/Credits";

export const metadata: Metadata = {
  title: "Credits & Acknowledgments",
  description:
    "The open-source projects this site is built on — frameworks, UI, 3D, tooling and hosting — with the licence each one ships under.",
  alternates: { canonical: "/credit" },
};

const CreditPage = () => {
  return <Credits />;
};

export default CreditPage;
