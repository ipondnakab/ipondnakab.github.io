import {
  RoomData,
  RoomStats,
  RoundHistoryEntry,
} from "@/features/planning-poker/model/poker";

// Snapshot a revealed round into a history entry. Pure — the caller is
// responsible for persisting the result. `group` is normalised to `null` and
// `deckType` falls back to "fibonacci" so the entry never carries `undefined`
// (which Firestore rejects).
export const buildRoundHistoryEntry = (
  roomData: RoomData,
  stats: RoomStats,
): RoundHistoryEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  endedAt: Date.now(),
  avg: stats.avg,
  total: stats.total,
  playerCount: Object.keys(roomData.votes).length,
  deckType: roomData.deckType ?? "fibonacci",
  votes: Object.values(roomData.votes).map((vote) => ({
    name: vote.name,
    score: vote.score,
    group: vote.group ?? null,
  })),
  // Spread conditionally: an absent note must leave the key off entirely, not
  // set it to `undefined`.
  ...(roomData.note ? { note: roomData.note } : {}),
});
