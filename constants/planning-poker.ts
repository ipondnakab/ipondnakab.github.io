// Query-string key that carries the admin secret.
export const PLANNING_POKER_ADMIN_PARAM = "c";

// Maximum number of completed rounds kept in a room's shared history. Older
// rounds are dropped so the room document stays small (Firestore 1 MB limit).
export const PLANNING_POKER_HISTORY_LIMIT = 20;

// Cap for the free-text note attached to a saved round. Short on purpose: the
// note renders as a chip next to the round's timestamp.
export const PLANNING_POKER_NOTE_MAX_LENGTH = 50;

export const PLANNING_POKER_MAX_GROUPS_LENGTH = 20; // max number of groups allowed in a room
