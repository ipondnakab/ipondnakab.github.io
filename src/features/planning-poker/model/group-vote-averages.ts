// One group's slice of a completed round.
export interface GroupAverage {
  group: string | null; // null = players who picked no group
  avg: string; // "-" when the group has nothing numeric to average
  total: number; // votes cast in this group
  playerCount: number; // players in this group
}
