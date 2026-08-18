import {
  PlayerVotes,
  RoundHistoryVote,
} from "@/features/planning-poker/model/poker";

// One group's slice of a completed round.
export interface GroupAverage {
  group: string | null; // null = players who picked no group
  avg: string; // "-" when the group has nothing numeric to average
  total: number; // votes cast in this group
  playerCount: number; // players in this group
}

const isNumericScore = (score: string | null): score is string =>
  score !== null && score.trim() !== "" && !isNaN(Number(score));

const average = (scores: number[]): string =>
  scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : "-";

// The live average for a single group in the room, formatted like every other
// average in the app. Same rules as buildGroupAverages below — numeric cards
// only, "-" when there is nothing to average.
export const buildGroupAverage = (votes: PlayerVotes, group: string): string =>
  average(
    Object.values(votes)
      .filter((vote) => vote.group === group)
      .map((vote) => vote.score)
      .filter(isNumericScore)
      .map(Number),
  );

// Break a round down per group, mirroring how the room-level average is
// computed: non-numeric cards ("?", "☕", t-shirt sizes) are skipped and a
// group with nothing numeric left reads "-".
//
// Groups keep the order they first appear in and the ungrouped bucket sorts
// last, so the breakdown stays stable across renders. An empty-string group is
// treated as ungrouped — the group picker writes "" when cleared.
export const buildGroupAverages = (
  votes: RoundHistoryVote[],
): GroupAverage[] => {
  const buckets = new Map<
    string | null,
    { scores: number[]; total: number; playerCount: number }
  >();

  votes.forEach((vote) => {
    const key = vote.group ? vote.group : null;
    const bucket = buckets.get(key) ?? { scores: [], total: 0, playerCount: 0 };
    bucket.playerCount += 1;
    if (vote.score !== null) bucket.total += 1;
    if (isNumericScore(vote.score)) bucket.scores.push(Number(vote.score));
    buckets.set(key, bucket);
  });

  const entries = [...buckets.entries()];
  return [
    ...entries.filter(([group]) => group !== null),
    ...entries.filter(([group]) => group === null),
  ].map(([group, { scores, total, playerCount }]) => ({
    group,
    avg:
      scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : "-",
    total,
    playerCount,
  }));
};
