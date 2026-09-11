import {
  BadmintonSession,
  PlayerForm,
} from "@/features/badminton/model/badminton";
export const MAX_PLAYERS = 64;
export const PLAYER_DEFAULTS: PlayerForm = { name: "", gender: "male" };
export const GENDERS = ["male", "female", "other"] as const;
export const FORMATS = ["singles", "doubles"] as const;
export const MODES = ["random", "competition"] as const;

export const PAIRINGS = ["any", "mixed", "same"] as const;

export const STANDING_COLUMNS = ["team", "played", "wins", "losses"] as const;

export const RANDOM_DRAW_ATTEMPTS = 32;

export const MOBILE_VIEWS = ["players", "play", "history"] as const;

export const BADMINTON_STORAGE_KEY = "badminton.session.v1";
export const DEFAULT_BADMINTON_SESSION: BadmintonSession = {
  version: 1,
  players: [],
  mode: "random",
  format: "doubles",
  pairing: "any",
  view: "players",
  draw: null,
  history: [],
  rounds: [],
};
