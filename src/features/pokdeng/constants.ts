import { PokdengMultiplierOption } from "@/interfaces/pokdeng";

// localStorage key holding the whole game. Versioned so a future shape change
// can be detected and discarded instead of crashing on stale data.
export const POKDENG_STORAGE_KEY = "pokdeng_game_v1";

// The "deng" multipliers, in the order they appear on a player's row. x1 is a
// plain win, the rest are the usual Pok Deng bonuses (two/three deng and tong).
export const POKDENG_MULTIPLIERS: PokdengMultiplierOption[] = [
  { value: 1, labelKey: "pokdeng.multiplierNormal" },
  { value: 2, labelKey: "pokdeng.multiplierTwoDeng" },
  { value: 3, labelKey: "pokdeng.multiplierThreeDeng" },
  { value: 5, labelKey: "pokdeng.multiplierTong" },
];

export const POKDENG_DEFAULT_MULTIPLIER = 1;

export const POKDENG_DEFAULT_BET = 10;
export const POKDENG_MIN_BET = 1;
export const POKDENG_MAX_BET = 1000000;

export const POKDENG_MAX_PLAYERS = 16;
export const POKDENG_NAME_MAX_LENGTH = 20;

// Settled turns kept for the history list and undo. Older turns drop off so the
// stored game stays small; `turnCount` keeps numbering them correctly.
export const POKDENG_HISTORY_LIMIT = 50;
