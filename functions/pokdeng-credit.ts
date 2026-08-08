import { POKDENG_HISTORY_LIMIT } from "@/constants/pokdeng";
import {
  PokdengGame,
  PokdengOutcome,
  PokdengPicks,
  PokdengPlayer,
  PokdengTurn,
  PokdengTurnResult,
} from "@/interfaces/pokdeng";

// Pure credit math for the Pok Deng tracker. Nothing here touches storage or
// React — the caller applies the returned game and persists it.

const createId = (): string => Math.random().toString(36).slice(2, 9);

export const createPokdengPlayer = (name: string): PokdengPlayer => ({
  id: createId(),
  name,
  credit: 0,
});

export const createPokdengGame = (
  hostName: string,
  bet: number,
  playerNames: string[],
): PokdengGame => ({
  hostName,
  bet,
  players: playerNames.map(createPokdengPlayer),
  turns: [],
  turnCount: 0,
});

// Wipe every balance and the turn log but keep the table seated — the "new
// session, same players" reset.
export const resetPokdengCredits = (game: PokdengGame): PokdengGame => ({
  ...game,
  players: game.players.map((player) => ({ ...player, credit: 0 })),
  turns: [],
  turnCount: 0,
});

// What one pick is worth to the player: positive when they beat the host,
// negative when the host beats them.
export const pokdengPickAmount = (
  bet: number,
  outcome: PokdengOutcome,
  multiplier: number,
): number => (outcome === "win" ? 1 : -1) * bet * multiplier;

// The host is the dealer, so their balance is the exact mirror of the table.
// Deriving it (rather than storing it) is what keeps the game zero-sum: the
// host row and the player rows can never drift apart.
// The `|| 0` normalises the -0 that negating an even table produces, so no
// caller ever has to reason about a signed zero.
export const pokdengHostCredit = (players: PokdengPlayer[]): number =>
  -players.reduce((sum, player) => sum + player.credit, 0) || 0;

// Signed credit for display: "+80", "-20", "0". Locale-grouped so large stakes
// stay readable.
export const formatPokdengCredit = (credit: number): string =>
  `${credit > 0 ? "+" : credit < 0 ? "-" : ""}${Math.abs(credit).toLocaleString()}`;

// Apply the host's picks to the running balances and push the settled turn onto
// the history. Players without a pick sat the turn out and are untouched; if
// nobody was picked the game is returned as-is so an empty turn is never saved.
export const settlePokdengTurn = (
  game: PokdengGame,
  picks: PokdengPicks,
): PokdengGame => {
  const results: PokdengTurnResult[] = game.players
    .filter((player) => picks[player.id])
    .map((player) => {
      const { outcome, multiplier } = picks[player.id];
      return {
        playerId: player.id,
        name: player.name,
        outcome,
        multiplier,
        amount: pokdengPickAmount(game.bet, outcome, multiplier),
      };
    });
  if (results.length === 0) return game;

  const amountByPlayerId = new Map(
    results.map((result) => [result.playerId, result.amount]),
  );
  const index = game.turnCount + 1;
  const turn: PokdengTurn = {
    id: `${Date.now()}-${index}`,
    index,
    endedAt: Date.now(),
    bet: game.bet,
    results,
    hostAmount: -results.reduce((sum, result) => sum + result.amount, 0) || 0,
  };

  return {
    ...game,
    players: game.players.map((player) => ({
      ...player,
      credit: player.credit + (amountByPlayerId.get(player.id) ?? 0),
    })),
    turns: [turn, ...game.turns].slice(0, POKDENG_HISTORY_LIMIT),
    turnCount: index,
  };
};

// Roll the most recent turn back off the balances — the fix for a misclick at a
// live table. Players who have since left are simply skipped.
export const undoPokdengTurn = (game: PokdengGame): PokdengGame => {
  const [turn, ...rest] = game.turns;
  if (!turn) return game;

  const amountByPlayerId = new Map(
    turn.results.map((result) => [result.playerId, result.amount]),
  );
  return {
    ...game,
    players: game.players.map((player) => ({
      ...player,
      credit: player.credit - (amountByPlayerId.get(player.id) ?? 0),
    })),
    turns: rest,
    turnCount: Math.max(0, game.turnCount - 1),
  };
};
