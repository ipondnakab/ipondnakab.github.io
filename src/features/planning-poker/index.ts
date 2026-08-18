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
  PLANNING_POKER_ADMIN_PARAM,
  PLANNING_POKER_HISTORY_LIMIT,
  PLANNING_POKER_MAX_GROUPS_LENGTH,
  PLANNING_POKER_NOTE_MAX_LENGTH,
} from "./constants";
export { buildRoundHistoryEntry } from "./lib/build-round-history-entry";
export {
  buildGroupAverage,
  buildGroupAverages,
} from "./lib/group-vote-averages";
export type { GroupAverage } from "./lib/group-vote-averages";
export { DECKS, DEFAULT_GROUP_COLOR, GROUP_COLOR_OPTIONS } from "./model/poker";
export type {
  DeckType,
  GroupObject,
  PlayerVote,
  PlayerVotes,
  RoomData,
  RoomStats,
  RoundHistoryEntry,
} from "./model/poker";
