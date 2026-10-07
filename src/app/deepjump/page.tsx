import Deepjump from "@/features/deepjump/components/Deepjump";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Deepjump",
  description:
    "Open app deeplinks and Android intent links with a tap, and keep your recent links on this device.",
  alternates: { canonical: "/deepjump" },
};
export interface DeepjumpPageProps {}
const DeepjumpPage: React.FC<DeepjumpPageProps> = () => <Deepjump />;
export default DeepjumpPage;
