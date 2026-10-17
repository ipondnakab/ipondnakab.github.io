import { describe, expect, it } from "vitest";
import { winnerOf } from "@/features/badminton/components/BadmintonScoreboard";

describe("badminton scoring", () => {
  it("requires 21 points and a two-point lead", () => {
    expect(winnerOf([20, 19])).toBeNull();
    expect(winnerOf([21, 19])).toBe(0);
    expect(winnerOf([19, 21])).toBe(1);
  });
  it("continues at deuce and caps the game at 30", () => {
    expect(winnerOf([21, 20])).toBeNull();
    expect(winnerOf([29, 29])).toBeNull();
    expect(winnerOf([30, 29])).toBe(0);
    expect(winnerOf([29, 30])).toBe(1);
  });
});
