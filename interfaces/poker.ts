export type DeckType = "fibonacci" | "tshirt" | "custom";

export interface PlayerVote {
  name: string;
  score: string | null;
  group?: string; // เพิ่มกลุ่มของผู้เล่น
}

export interface PlayerVotes {
  [userId: string]: PlayerVote;
}

export interface RoomData {
  adminId: string; // เก็บ ID ของหัวห้อง
  revealed: boolean;
  deckType: DeckType;
  customDeck?: string[]; // ใช้เมื่อ deckType เป็น "custom"
  groups?: string[]; // ใช้สำหรับจัดกลุ่มผู้เล่น
  votes: PlayerVotes;
}

export interface RoomStats {
  avg: string;
  total: number;
}

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
