import type { Metadata } from "next";

import DrunkardGameLanding from "@/features/drunkard-game/components/DrunkardGameLanding";

const TITLE = "Drunkard Game — Party Games for Android";
const DESCRIPTION =
  "Bring the party together with King's Cup, Heads Up, and Slot Machine in one playful Android app.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/drunkard-game" },
  openGraph: {
    type: "website",
    url: "/drunkard-game",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const DrunkardGamePage = () => {
  return <DrunkardGameLanding />;
};

export default DrunkardGamePage;
