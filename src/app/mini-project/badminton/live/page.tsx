import RealtimeBadmintonRoom from "@/features/badminton/components/RealtimeBadmintonRoom";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Badminton Scoreboard",
  description:
    "Create or join a shared badminton scoreboard room and score together in real time.",
  alternates: { canonical: "/mini-project/badminton/live" },
};

export default function LiveBadmintonPage() {
  return <RealtimeBadmintonRoom />;
}
