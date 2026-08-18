import { describe, expect, it } from "vitest";

import {
  buildGroupAverage,
  buildGroupAverages,
} from "@/features/planning-poker/lib/group-vote-averages";
import {
  PlayerVotes,
  RoundHistoryVote,
} from "@/features/planning-poker/model/poker";

describe("buildGroupAverage", () => {
  const votes: PlayerVotes = {
    a: { name: "Ann", score: "3", group: "fe" },
    b: { name: "Ben", score: "5", group: "fe" },
    c: { name: "Cat", score: "13", group: "be" },
    d: { name: "Dan", score: "?", group: "fe" },
  };

  it("averages only the numeric cards in the group", () => {
    expect(buildGroupAverage(votes, "fe")).toBe("4.0");
  });

  it("reads '-' when the group has nothing numeric", () => {
    expect(
      buildGroupAverage({ a: { name: "Ann", score: "?", group: "fe" } }, "fe"),
    ).toBe("-");
    expect(buildGroupAverage(votes, "qa")).toBe("-");
  });
});

describe("buildGroupAverages", () => {
  it("buckets by group and skips non-numeric cards in the average", () => {
    const votes: RoundHistoryVote[] = [
      { name: "Ann", score: "3", group: "fe" },
      { name: "Ben", score: "5", group: "fe" },
      { name: "Dan", score: "☕", group: "fe" },
      { name: "Cat", score: "13", group: "be" },
    ];

    const [fe, be] = buildGroupAverages(votes);

    expect(fe).toEqual({ group: "fe", avg: "4.0", total: 3, playerCount: 3 });
    expect(be).toEqual({ group: "be", avg: "13.0", total: 1, playerCount: 1 });
  });

  it("sorts the ungrouped bucket last and treats '' as ungrouped", () => {
    const votes: RoundHistoryVote[] = [
      { name: "Ann", score: "8", group: "" },
      { name: "Ben", score: "2", group: "fe" },
      { name: "Cat", score: "4", group: undefined },
    ];

    const result = buildGroupAverages(votes);

    expect(result.map((r) => r.group)).toEqual(["fe", null]);
    expect(result[1]).toEqual({
      group: null,
      avg: "6.0",
      total: 2,
      playerCount: 2,
    });
  });

  it("counts a player who did not vote but leaves them out of the total", () => {
    const votes: RoundHistoryVote[] = [
      { name: "Ann", score: "5", group: "fe" },
      { name: "Ben", score: null, group: "fe" },
    ];

    expect(buildGroupAverages(votes)[0]).toEqual({
      group: "fe",
      avg: "5.0",
      total: 1,
      playerCount: 2,
    });
  });

  it("reads '-' for a group where nobody played a number", () => {
    const votes: RoundHistoryVote[] = [
      { name: "Ann", score: "?", group: "fe" },
      { name: "Ben", score: null, group: "fe" },
    ];
    expect(buildGroupAverages(votes)[0].avg).toBe("-");
  });
});
