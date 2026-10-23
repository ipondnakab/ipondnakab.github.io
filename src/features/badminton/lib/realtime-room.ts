import { db } from "@/shared/lib/firebase";
import {
  doc,
  getDoc,
  runTransaction,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export type RoomMode = "standard" | "freehand";
export type Score = [number, number];
export interface ScoreRoom {
  names: [string, string];
  points: Score;
  games: Score[];
  mode: RoomMode;
  revision: number;
}
const collection = "badmintonScoreRooms";
const roomRef = (code: string) => doc(db, collection, code);
export const normalizeCode = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
export const newRoomCode = () => {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => "abcdefghjkmnpqrstuvwxyz23456789"[n % 32]).join("");
};
export const subscribeRoom = (
  code: string,
  next: (room: ScoreRoom | null) => void,
  error: (error: Error) => void,
) =>
  onSnapshot(
    roomRef(code),
    (snapshot) => {
      next(snapshot.exists() ? (snapshot.data() as ScoreRoom) : null);
    },
    error,
  );
export const createRoom = async (code: string) => {
  const ref = roomRef(code);
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists()) throw new Error("Room name already exists.");
    transaction.set(ref, {
      names: ["Red Team", "Blue Team"],
      points: [0, 0],
      games: [],
      mode: "freehand",
      revision: 0,
      createdAt: serverTimestamp(),
    });
  });
};
export const roomExists = async (code: string) => {
  return (await getDoc(roomRef(code))).exists();
};
export const winnerOf = ([a, b]: Score): number | null => {
  if (a === 30 && a > b) return 0;
  if (b === 30 && b > a) return 1;
  if (a >= 21 && a - b >= 2) return 0;
  if (b >= 21 && b - a >= 2) return 1;
  return null;
};
export type RoomAction =
  | { type: "point"; side: 0 | 1; delta: -1 | 1 }
  | { type: "reset" }
  | { type: "mode"; mode: RoomMode }
  | { type: "name"; side: 0 | 1; name: string };
export const updateRoom = async (code: string, action: RoomAction) => {
  await runTransaction(db, async (transaction) => {
    const ref = roomRef(code);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error("Room not found");
    const current = snapshot.data() as ScoreRoom;
    const points: Score = [...current.points];
    let games = [...current.games];
    let mode = current.mode;
    const names: [string, string] = [...current.names];
    if (action.type === "point") {
      const wins = [0, 1].map(
        (side) => games.filter((game) => winnerOf(game) === side).length,
      );
      if (mode === "standard" && wins.some((count) => count >= 2)) return;
      if (action.delta === -1 && points[action.side] === 0) return;
      if (mode === "standard" && action.delta === -1) return;
      points[action.side] = Math.max(0, points[action.side] + action.delta);
      if (mode === "standard" && winnerOf(points) !== null) {
        games = [...games, [...points] as Score];
        points[0] = 0;
        points[1] = 0;
      }
    } else if (action.type === "reset") {
      points[0] = 0;
      points[1] = 0;
      games = [];
    } else if (action.type === "mode") {
      mode = action.mode;
      points[0] = 0;
      points[1] = 0;
      games = [];
    } else if (action.type === "name") {
      names[action.side] =
        action.name.trim().slice(0, 40) || `Team ${action.side + 1}`;
    }
    transaction.update(ref, {
      points,
      games,
      mode,
      names,
      revision: current.revision + 1,
    });
  });
};
