import type { Metadata } from "next";

import PokdengCredit from "@/components/pokdeng/PokdengCredit";

const TITLE = "Pok Deng Credit Tracker — Host vs Players Scoreboard";
const DESCRIPTION =
  "A free Pok Deng credit tracker. Add the host and players, set a base bet, then settle each turn with win/lose and the deng multiplier — balances stay zero-sum and are saved on your device.";
const OG_IMAGE = {
  url: "/images/avatar-profile-square.png",
  width: 800,
  height: 800,
  alt: "Pok Deng credit tracker",
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "pokdeng",
    "pok deng",
    "ป๊อกเด้ง",
    "pok deng credit",
    "pok deng scoreboard",
    "card game score tracker",
    "credit tracker",
    "dealer vs players",
  ],
  alternates: { canonical: "/pokdeng" },
  openGraph: {
    type: "website",
    url: "/pokdeng",
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

const PokdengPage = () => {
  return <PokdengCredit />;
};

export default PokdengPage;
