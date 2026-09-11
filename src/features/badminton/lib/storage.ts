import {
  BADMINTON_STORAGE_KEY,
  FORMATS,
  GENDERS,
  MAX_PLAYERS,
  MOBILE_VIEWS,
  MODES,
  PAIRINGS,
} from "@/features/badminton/constants";
import {
  BadmintonSession,
  Format,
  Player,
  RandomDraw,
  SessionLoadResult,
} from "@/features/badminton/model/badminton";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isChoice = <T extends string>(
  value: unknown,
  choices: readonly T[],
): value is T => choices.some((choice) => choice === value);
const isPlayer = (value: unknown): value is Player =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.id.length > 0 &&
  typeof value.name === "string" &&
  value.name.trim().length > 0 &&
  value.name.length <= 40 &&
  isChoice(value.gender, GENDERS);
const isRoster = (value: unknown): value is Player[] =>
  Array.isArray(value) &&
  value.length <= MAX_PLAYERS &&
  value.every(isPlayer) &&
  new Set(value.map((player) => player.id)).size === value.length;
const isTeams = (value: unknown, format: Format): value is Player[][] =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every(
    (team) => isRoster(team) && team.length === (format === "singles" ? 1 : 2),
  ) &&
  isRoster(value.flat());
const isDraw = (value: unknown): value is RandomDraw => {
  if (
    !isRecord(value) ||
    !isChoice(value.format, FORMATS) ||
    !Array.isArray(value.matches) ||
    !isRoster(value.waiting)
  )
    return false;
  const format = value.format;
  return (
    value.matches.length <= MAX_PLAYERS / 2 &&
    value.matches.every((match) => isTeams(match, format)) &&
    isRoster([...value.matches.flat(2), ...value.waiting])
  );
};
const isSession = (value: unknown): value is BadmintonSession => {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRoster(value.players) ||
    !isChoice(value.mode, MODES) ||
    !isChoice(value.format, FORMATS) ||
    !isChoice(value.pairing, PAIRINGS) ||
    !isChoice(value.view, MOBILE_VIEWS) ||
    !(value.draw === null || isDraw(value.draw)) ||
    !Array.isArray(value.history) ||
    !Array.isArray(value.rounds)
  )
    return false;
  const format = value.format;
  return (
    value.history.every(
      (entry) =>
        isDraw(entry) && isRecord(entry) && isChoice(entry.pairing, PAIRINGS),
    ) &&
    value.rounds.length < MAX_PLAYERS &&
    value.rounds.every(
      (round) =>
        Array.isArray(round) &&
        round.length <= MAX_PLAYERS / 2 &&
        round.every(
          (match) =>
            isRecord(match) &&
            isTeams(match.teams, format) &&
            (match.winner === null || match.winner === 0 || match.winner === 1),
        ),
    )
  );
};

export const loadSession = (): SessionLoadResult => {
  if (typeof window === "undefined")
    return { session: null, unavailable: false };
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(BADMINTON_STORAGE_KEY);
  } catch {
    return { session: null, unavailable: true };
  }
  if (!raw) return { session: null, unavailable: false };
  try {
    const value: unknown = JSON.parse(raw);
    return { session: isSession(value) ? value : null, unavailable: false };
  } catch {
    return { session: null, unavailable: false };
  }
};

export const saveSession = (session: BadmintonSession): boolean => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(BADMINTON_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};
