import type { ScoreRoom } from "@/features/badminton/model/realtime-room";

export interface RoomMessage {
  type: "score";
  room: ScoreRoom;
}

export type Status = "connecting" | "direct" | "firebase";

export type PeerSession = (() => void) & {
  broadcast: (room: ScoreRoom) => void;
};
