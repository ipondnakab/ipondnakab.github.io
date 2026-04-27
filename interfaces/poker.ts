export type DeckType = "fibonacci" | "tshirt" | "custom";

export interface PlayerVote {
  name: string;
  score: string | null;
}

export interface RoomData {
  adminId: string; // เก็บ ID ของหัวห้อง
  revealed: boolean;
  deckType: DeckType;
  customDeck?: string[]; // ใช้เมื่อ deckType เป็น "custom"
  votes: {
    [userId: string]: PlayerVote;
  };
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

// ตำแหน่ง Fixed รอบโต๊ะ (X, Y ในรูปแบบ CSS % หรือ Class)
export const TABLE_SLOTS = [
  "top-[-40px] left-1/2 -translate-x-1/2", // North
  "top-0 right-0", // North-East
  "top-1/2 right-[-40px] -translate-y-1/2", // East
  "bottom-0 right-0", // South-East
  "bottom-[-40px] left-1/2 -translate-x-1/2", // South
  "bottom-0 left-0", // South-West
  "top-1/2 left-[-40px] -translate-y-1/2", // West
  "top-0 left-0", // North-West
];
