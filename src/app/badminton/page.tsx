import Badminton from "@/features/badminton/components/Badminton";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Badminton Team Organizer",
  description:
    "Create random badminton singles or doubles matches and singles or doubles round-robin competitions.",
  alternates: { canonical: "/badminton" },
};
export interface BadmintonPageProps {}
const BadmintonPage: React.FC<BadmintonPageProps> = () => <Badminton />;
export default BadmintonPage;
