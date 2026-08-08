// Pok Deng credit tracker. One host (the dealer) settles every turn against the
// players sitting at the table: each player either beats the host or loses to
// them, for the base bet multiplied by a "deng" multiplier.
//
// Balances are zero-sum — whatever the players win, the host loses — so the
// host's credit is always derived from the players' and never stored.

export type PokdengOutcome = "win" | "lose";

// A "deng" multiplier offered on each player's row. `labelKey` is an i18n key
// rather than literal text so the deck reads correctly in every language.
export interface PokdengMultiplierOption {
  value: number;
  labelKey: string;
}

export interface PokdengPlayer {
  id: string;
  name: string;
  credit: number; // running balance, from the player's point of view
}

// What the host has picked for one player in the turn being settled. Players
// with no pick sat the turn out and their credit is left untouched.
export interface PokdengPick {
  outcome: PokdengOutcome;
  multiplier: number;
}

export interface PokdengPicks {
  [playerId: string]: PokdengPick;
}

// One player's settled result inside a completed turn. `name` is snapshotted so
// the history stays readable after a rename or a removal.
export interface PokdengTurnResult {
  playerId: string;
  name: string;
  outcome: PokdengOutcome;
  multiplier: number;
  amount: number; // signed, from the player's point of view
}

export interface PokdengTurn {
  id: string;
  index: number; // 1-based turn number, for display
  endedAt: number; // epoch ms when the turn was settled
  bet: number; // base bet in force when the turn was settled
  results: PokdengTurnResult[];
  hostAmount: number; // signed mirror of the results' sum
}

// The whole tracker, as persisted to localStorage.
export interface PokdengGame {
  hostName: string;
  bet: number;
  players: PokdengPlayer[];
  turns: PokdengTurn[]; // most-recent-first
  turnCount: number; // turns settled so far, including any aged out of `turns`
}
