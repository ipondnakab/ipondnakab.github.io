import StandaloneBadmintonScoreboard from "@/features/badminton/components/StandaloneBadmintonScoreboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badminton Scoreboard",
  description:
    "A standalone badminton scoreboard with standard and freehand scoring, undo, and adjustable score size.",
  alternates: { canonical: "/mini-project/badminton/scoreboard" },
};

const BadmintonScoreboardPage = () => <StandaloneBadmintonScoreboard />;

export default BadmintonScoreboardPage;
