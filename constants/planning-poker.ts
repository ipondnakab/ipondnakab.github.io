// Query-string key that carries the admin secret.
export const PLANNING_POKER_ADMIN_PARAM = "c";

// Maximum number of completed rounds kept in a room's shared history. Older
// rounds are dropped so the room document stays small (Firestore 1 MB limit).
export const PLANNING_POKER_HISTORY_LIMIT = 20;
