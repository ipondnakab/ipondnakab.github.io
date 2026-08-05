export type DeckType = "fibonacci" | "tshirt" | "custom";

export interface PlayerVote {
  name: string;
  score: string | null;
  group?: string; // เพิ่มกลุ่มของผู้เล่น
}

export interface PlayerVotes {
  [userId: string]: PlayerVote;
}

export interface GroupObject {
  name: string;
  color: string; // สีของกลุ่ม (สามารถใช้เป็นรหัสสี HEX หรือชื่อสี)
}

// A single player's vote as captured in a completed round. `group` is
// normalised to `null` (never `undefined`) because Firestore rejects
// `undefined` values.
export interface RoundHistoryVote {
  name: string;
  score: string | null;
  group?: string | null;
}

// A snapshot of one completed (revealed) round, saved when the round is reset.
export interface RoundHistoryEntry {
  id: string; // unique id for React keys / dedupe
  endedAt: number; // epoch ms when the round was recorded
  avg: string; // average of numeric votes, "-" when none
  total: number; // number of cast votes
  playerCount: number; // players present when the round ended
  deckType: DeckType;
  votes: RoundHistoryVote[];
  note?: string; // short label for the round ("PROJ-123 login page"); the key
  // is dropped entirely when the note is cleared, so it is never "" or null
}

export interface RoomData {
  revealed: boolean;
  deckType: DeckType;
  customDeck?: string[]; // ใช้เมื่อ deckType เป็น "custom"
  groupOptions?: GroupObject[]; // กลุ่มผู้เล่นพร้อมสี (ชื่อและสี) สำหรับการแสดงผล
  sortByGroup?: boolean; // เรียงการ์ดผู้เล่นตามกลุ่มให้ทุกคนเห็นเหมือนกัน
  votes: PlayerVotes;
  note?: string; // what the room is estimating right now; copied into the
  // history entry on reset, then cleared for the next round
  history?: RoundHistoryEntry[]; // most-recent-first log of completed rounds
}

export interface RoomStats {
  avg: string;
  total: number;
}

export interface GroupColorOption {
  label: string;
  value: string; // รหัสสี HEX
}

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
