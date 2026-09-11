import { RANDOM_DRAW_ATTEMPTS } from "@/features/badminton/constants";
import {
  Format,
  Match,
  Pairing,
  Player,
  RandomDraw,
  Standing,
  Team,
} from "@/features/badminton/model/badminton";

const shuffle = <T>(items: T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const pairPlayers = (
  players: Player[],
  pairing: Pairing,
  random: () => number,
  partnerCost: (a: Player, b: Player) => number = () => 0,
) => {
  const pool = shuffle(players, random);
  const teams: Team[] = [];
  const waiting: Player[] = [];
  while (pool.length) {
    const player = pool.shift()!;
    const candidates = pool
      .map((other, index) => ({ other, index }))
      .filter(
        ({ other }) =>
          pairing === "any" ||
          (pairing === "same"
            ? other.gender === player.gender
            : (player.gender === "male" && other.gender === "female") ||
              (player.gender === "female" && other.gender === "male")),
      );
    candidates.sort(
      (a, b) => partnerCost(player, a.other) - partnerCost(player, b.other),
    );
    const index = candidates[0]?.index ?? -1;
    if (index < 0) waiting.push(player);
    else teams.push([player, pool.splice(index, 1)[0]]);
  }
  // Preserve preferred pairs before relaxing the rule for unmatched players.
  while (waiting.length >= 2) {
    const player = waiting.shift()!;
    waiting.sort((a, b) => partnerCost(player, a) - partnerCost(player, b));
    teams.push([player, waiting.shift()!]);
  }
  return { teams: shuffle(teams, random), waiting };
};

const partnerKey = (a: Player, b: Player) =>
  JSON.stringify([a.id, b.id].sort());

export const randomMatches = (
  players: Player[],
  pairing: Pairing,
  random = Math.random,
  history: RandomDraw[] = [],
  format: Format = "doubles",
): RandomDraw => {
  const counts = new Map<string, number>();
  for (const draw of history.filter((entry) => entry.format === format))
    for (const team of format === "singles"
      ? draw.matches.map((match) => match.flat())
      : draw.matches.flat()) {
      const key = partnerKey(team[0], team[1]);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  const partnerCost = (a: Player, b: Player) =>
    counts.get(partnerKey(a, b)) ?? 0;
  let best: RandomDraw = { format, matches: [], waiting: [...players] };
  let bestCost = Infinity;
  for (let attempt = 0; attempt < RANDOM_DRAW_ATTEMPTS; attempt++) {
    const { teams, waiting } = pairPlayers(
      players,
      format === "singles" ? "any" : pairing,
      random,
      partnerCost,
    );
    const matches: Team[][] = [];
    if (format === "singles") {
      for (const pair of teams) matches.push([[pair[0]], [pair[1]]]);
    } else {
      for (let i = 0; i + 1 < teams.length; i += 2)
        matches.push([teams[i], teams[i + 1]]);
      if (teams.length % 2) waiting.push(...teams[teams.length - 1]);
    }
    const relationships =
      format === "singles"
        ? matches.map((match) => match.flat())
        : matches.flat();
    const cost = relationships.reduce(
      (sum, team) => sum + partnerCost(team[0], team[1]),
      0,
    );
    if (cost < bestCost) {
      best = { format, matches, waiting };
      bestCost = cost;
    }
    if (bestCost === 0) break;
  }
  return best;
};

export const createCompetition = (
  players: Player[],
  format: Format,
  pairing: Pairing,
  random = Math.random,
): Match[][] => {
  const paired =
    format === "singles"
      ? { teams: shuffle(players, random).map((p) => [p]), waiting: [] }
      : pairPlayers(players, pairing, random);
  if (paired.teams.length < 2 || paired.waiting.length)
    throw new Error("incompatibleRoster");
  const rotation: (Team | null)[] = [...paired.teams];
  if (rotation.length % 2) rotation.push(null);
  const rounds: Match[][] = [];
  for (let r = 0; r < rotation.length - 1; r++) {
    const matches: Match[] = [];
    for (let i = 0; i < rotation.length / 2; i++) {
      const a = rotation[i],
        b = rotation[rotation.length - 1 - i];
      if (a && b) matches.push({ teams: [a, b], winner: null });
    }
    rounds.push(matches);
    rotation.splice(1, 0, rotation.pop()!);
  }
  return rounds;
};

export const standings = (rounds: Match[][]): Standing[] => {
  const rows = new Map<string, Standing>();
  for (const match of rounds.flat())
    match.teams.forEach((team, side) => {
      const key = team.map((p) => p.id).join("|");
      const row = rows.get(key) ?? { team, played: 0, wins: 0, losses: 0 };
      if (match.winner !== null) {
        row.played++;
        if (match.winner === side) row.wins++;
        else row.losses++;
      }
      rows.set(key, row);
    });
  return [...rows.values()].sort((a, b) => b.wins - a.wins);
};
