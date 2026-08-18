import { POKDENG_STORAGE_KEY } from "@/features/pokdeng/constants";
import { PokdengGame } from "@/features/pokdeng/model/pokdeng";

// The site is a static export with no server, so the tracker's whole state
// lives in localStorage on the host's device. Every helper here is safe to call
// during SSR (they no-op) and swallows quota/private-mode failures — a table in
// progress must never be interrupted by a storage error.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Structural check against the persisted shape. Anything that fails is treated
// as stale data from an older build and discarded rather than rendered.
const isPokdengGame = (value: unknown): value is PokdengGame => {
  if (!isRecord(value)) return false;
  if (
    typeof value.hostName !== "string" ||
    typeof value.bet !== "number" ||
    typeof value.turnCount !== "number" ||
    !Array.isArray(value.players) ||
    !Array.isArray(value.turns)
  ) {
    return false;
  }
  return (value.players as unknown[]).every(
    (player: unknown) =>
      isRecord(player) &&
      typeof player.id === "string" &&
      typeof player.name === "string" &&
      typeof player.credit === "number" &&
      // `status` is optional (older saves predate it), but a value that is
      // present must be one we recognise — an unknown string would read as
      // "not active" and silently lock the seat out of every turn.
      (player.status === undefined ||
        player.status === "active" ||
        player.status === "paused" ||
        player.status === "left"),
  );
};

export const loadPokdengGame = (): PokdengGame | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POKDENG_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPokdengGame(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const savePokdengGame = (game: PokdengGame): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(POKDENG_STORAGE_KEY, JSON.stringify(game));
  } catch {
    // Storage is full or blocked — the in-memory game still works for this
    // session, which is better than tearing the table down.
  }
};

export const clearPokdengGame = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(POKDENG_STORAGE_KEY);
  } catch {
    // Nothing to recover from; the caller has already reset its own state.
  }
};
