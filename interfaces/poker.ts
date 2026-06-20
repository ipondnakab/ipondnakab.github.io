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

export interface RoomData {
  revealed: boolean;
  deckType: DeckType;
  customDeck?: string[]; // ใช้เมื่อ deckType เป็น "custom"
  groupOptions?: GroupObject[]; // กลุ่มผู้เล่นพร้อมสี (ชื่อและสี) สำหรับการแสดงผล
  sortByGroup?: boolean; // เรียงการ์ดผู้เล่นตามกลุ่มให้ทุกคนเห็นเหมือนกัน
  votes: PlayerVotes;
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
