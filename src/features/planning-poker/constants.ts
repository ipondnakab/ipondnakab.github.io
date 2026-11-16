// Query-string key that carries the admin secret.
export const PLANNING_POKER_ADMIN_PARAM = "c";

// Maximum number of completed rounds kept in a room's shared history. Older
// rounds are dropped so the room document stays small (Firestore 1 MB limit).
export const PLANNING_POKER_HISTORY_LIMIT = 20;

// Cap for the free-text note attached to a saved round. Short on purpose: the
// note renders as a chip next to the round's timestamp.
export const PLANNING_POKER_NOTE_MAX_LENGTH = 50;

export const PLANNING_POKER_MAX_GROUPS_LENGTH = 20; // max number of groups allowed in a room

import type {
  DeckType,
  GroupColorOption,
} from "@/features/planning-poker/model/poker";

// ชุดสีสำเร็จรูปสำหรับเลือกให้แต่ละกลุ่มผ่าน dropdown
export const GROUP_COLOR_OPTIONS: GroupColorOption[] = [
  { label: "Red", value: "#d80032" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Orange", value: "#f97316" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Amber", value: "#f59e0b" },
];

export const DEFAULT_GROUP_COLOR = GROUP_COLOR_OPTIONS[0].value;

export const DECKS: Record<DeckType, string[]> = {
  fibonacci: [
    "0",
    "1",
    "2",
    "3",
    "5",
    "8",
    "13",
    "21",
    "34",
    "55",
    "89",
    "☕",
    "?",
  ],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "☕", "?"],
  custom: ["0.2", "0.5", "1", "2", "3", "4", "5", "8", "☕", "?"],
};
