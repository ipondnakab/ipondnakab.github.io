import {
  BADMINTON_STORAGE_KEY,
  DEFAULT_BADMINTON_SESSION,
} from "@/features/badminton/constants";
import {
  createCompetition,
  randomMatches,
} from "@/features/badminton/lib/draw";
import { loadSession, saveSession } from "@/features/badminton/lib/storage";
import { Player } from "@/features/badminton/model/badminton";
import { beforeEach, describe, expect, it, vi } from "vitest";
const players: Player[] = Array.from({ length: 4 }, (_, i) => ({
  id: String(i),
  name: `Player ${i}`,
  gender: "male",
}));

describe("badminton local storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it("restores roster, preferences, random history and competition winners", () => {
    const history = [
      { ...randomMatches(players, "any"), pairing: "any" as const },
    ];
    const rounds = createCompetition(players, "singles", "any");
    rounds[0][0].winner = 1;
    const session = {
      ...DEFAULT_BADMINTON_SESSION,
      players,
      mode: "competition" as const,
      format: "singles" as const,
      rounds,
      history,
      view: "history" as const,
    };
    expect(saveSession(session)).toBe(true);
    expect(loadSession()).toEqual({ session, unavailable: false });
    const randomSession = {
      ...session,
      mode: "random" as const,
      format: "doubles" as const,
      rounds: [],
      draw: history[0],
    };
    expect(saveSession(randomSession)).toBe(true);
    expect(loadSession().session).toEqual(randomSession);
  });
  it("handles missing, corrupt and unsupported saved data", () => {
    expect(loadSession().session).toBeNull();
    for (const value of [
      "{",
      "null",
      "[]",
      JSON.stringify({ ...DEFAULT_BADMINTON_SESSION, version: 99 }),
      JSON.stringify({ ...DEFAULT_BADMINTON_SESSION, players: [{ id: "x" }] }),
      JSON.stringify({
        ...DEFAULT_BADMINTON_SESSION,
        history: [{ matches: [[[]]], waiting: [] }],
      }),
    ]) {
      localStorage.setItem(BADMINTON_STORAGE_KEY, value);
      expect(loadSession()).toEqual({ session: null, unavailable: false });
    }
  });
  it("rejects invalid result shapes and duplicate player IDs", () => {
    const rounds = createCompetition(players, "singles", "any");
    rounds[0][0].winner = 8;
    for (const session of [
      { ...DEFAULT_BADMINTON_SESSION, players: [players[0], players[0]] },
      { ...DEFAULT_BADMINTON_SESSION, rounds },
      {
        ...DEFAULT_BADMINTON_SESSION,
        draw: {
          format: "doubles",
          matches: [[[players[0]], [players[1]]]],
          waiting: [],
        },
      },
    ]) {
      localStorage.setItem(BADMINTON_STORAGE_KEY, JSON.stringify(session));
      expect(loadSession().session).toBeNull();
    }
  });
  it("keeps storage failures recoverable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadSession()).toEqual({ session: null, unavailable: true });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(saveSession(DEFAULT_BADMINTON_SESSION)).toBe(false);
  });
});
