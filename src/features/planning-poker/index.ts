/**
 * Public API. Import types, constants and helpers from here.
 *
 * Components are deliberately NOT re-exported: in the App Router every client
 * component reachable from a barrel is registered in the route's client-
 * reference manifest, so re-exporting them pulls the whole feature into any
 * route that touches the barrel. Import components by path instead, e.g.
 * `@/features/<name>/components/<Component>`.
 */
export {
  DECKS,
  DEFAULT_GROUP_COLOR,
  GROUP_COLOR_OPTIONS,
} from "@/features/planning-poker/constants";
export { buildRoundHistoryEntry } from "@/features/planning-poker/lib/build-round-history-entry";
export {
  buildGroupAverage,
  buildGroupAverages,
} from "@/features/planning-poker/lib/group-vote-averages";
export type { GroupAverage } from "@/features/planning-poker/model/group-vote-averages";
export type {
  DeckType,
  GroupObject,
  PlayerVote,
  PlayerVotes,
  RoomData,
  RoomStats,
  RoundHistoryEntry,
} from "@/features/planning-poker/model/poker";
export {
  PLANNING_POKER_ADMIN_PARAM,
  PLANNING_POKER_HISTORY_LIMIT,
  PLANNING_POKER_MAX_GROUPS_LENGTH,
  PLANNING_POKER_NOTE_MAX_LENGTH,
} from "./constants";
