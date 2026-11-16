import type { Score } from "@/features/badminton/model/realtime-room";

export const winnerOf = ([a, b]: Score): number | null => {
  if (a === 30 && a > b) return 0;
  if (b === 30 && b > a) return 1;
  if (a >= 21 && a - b >= 2) return 0;
  if (b >= 21 && b - a >= 2) return 1;
  return null;
};
