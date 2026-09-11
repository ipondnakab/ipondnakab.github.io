export type Gender = "male" | "female" | "other";
export type Format = "singles" | "doubles";
export type Pairing = "any" | "mixed" | "same";
export interface PlayerForm {
  name: string;
  gender: Gender;
}
export interface Player extends PlayerForm {
  id: string;
}
export type Team = Player[];
export interface Match {
  teams: [Team, Team];
  winner: number | null;
}
export interface RandomDraw {
  format: Format;
  matches: Team[][];
  waiting: Player[];
}
export interface Standing {
  team: Team;
  played: number;
  wins: number;
  losses: number;
}

export interface RandomHistoryEntry extends RandomDraw {
  pairing: Pairing;
}

export type BadmintonView = "players" | "play" | "history";

export interface BadmintonSession {
  version: 1;
  players: Player[];
  mode: "random" | "competition";
  format: Format;
  pairing: Pairing;
  view: BadmintonView;
  draw: RandomDraw | null;
  history: RandomHistoryEntry[];
  rounds: Match[][];
}

export interface SessionLoadResult {
  session: BadmintonSession | null;
  unavailable: boolean;
}
