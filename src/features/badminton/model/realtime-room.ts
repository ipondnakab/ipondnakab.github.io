export type RoomMode = "standard" | "freehand";

export type Score = [number, number];

export interface ScoreRoom {
  names: [string, string];
  points: Score;
  games: Score[];
  mode: RoomMode;
  revision: number;
}

export type RoomAction =
  | { type: "point"; side: 0 | 1; delta: -1 | 1 }
  | { type: "reset" }
  | { type: "mode"; mode: RoomMode }
  | { type: "name"; side: 0 | 1; name: string };
