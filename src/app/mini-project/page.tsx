import type { Metadata } from "next";

import MiniProjectList from "@/features/mini-project/components/MiniProjectList";

export const metadata: Metadata = {
  title: "Mini Projects",
  description:
    "A catalogue of small web experiments built by Kittipat Daengdee — planning poker, a Pok Deng credit tracker, a PromptPay QR generator and more.",
  alternates: { canonical: "/mini-project" },
};

const MiniProjectPage = () => {
  return <MiniProjectList />;
};

export default MiniProjectPage;
