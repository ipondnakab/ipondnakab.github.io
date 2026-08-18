import { describe, expect, it } from "vitest";

import {
  createPokdengGame,
  formatPokdengCredit,
  isPokdengPlayerActive,
  pokdengHostCredit,
  pokdengPickAmount,
  resetPokdengCredits,
  setPokdengPlayerStatus,
  settlePokdengTurn,
  undoPokdengTurn,
} from "@/features/pokdeng/lib/credit";
import { PokdengPicks } from "@/features/pokdeng/model/pokdeng";

const game = () => createPokdengGame("Host", 20, ["Ann", "Ben"]);
const idsOf = (g: ReturnType<typeof game>) => g.players.map((p) => p.id);

describe("pokdengPickAmount", () => {
  it("credits a win and debits a loss by bet x multiplier", () => {
    expect(pokdengPickAmount(20, "win", 2)).toBe(40);
    expect(pokdengPickAmount(20, "lose", 2)).toBe(-40);
  });
});

describe("pokdengHostCredit", () => {
  it("mirrors the table so the game stays zero-sum", () => {
    const players = [
      { id: "a", name: "Ann", credit: 40, status: "active" as const },
      { id: "b", name: "Ben", credit: -100, status: "active" as const },
    ];
    expect(pokdengHostCredit(players)).toBe(60);
    expect(pokdengHostCredit(players) + 40 + -100).toBe(0);
  });

  it("normalises the -0 produced by an even table", () => {
    const players = [
      { id: "a", name: "Ann", credit: 20, status: "active" as const },
      { id: "b", name: "Ben", credit: -20, status: "active" as const },
    ];
    expect(Object.is(pokdengHostCredit(players), 0)).toBe(true);
  });
});

describe("formatPokdengCredit", () => {
  it("signs non-zero balances and leaves zero bare", () => {
    expect(formatPokdengCredit(80)).toBe("+80");
    expect(formatPokdengCredit(-20)).toBe("-20");
    expect(formatPokdengCredit(0)).toBe("0");
  });
});

describe("settlePokdengTurn", () => {
  it("applies picks, mirrors the host and logs the turn", () => {
    const g = game();
    const [ann, ben] = idsOf(g);
    const picks: PokdengPicks = {
      [ann]: { outcome: "win", multiplier: 1 },
      [ben]: { outcome: "lose", multiplier: 2 },
    };

    const next = settlePokdengTurn(g, picks);

    expect(next.players.map((p) => p.credit)).toEqual([20, -40]);
    expect(pokdengHostCredit(next.players)).toBe(20);
    expect(next.turnCount).toBe(1);
    expect(next.turns).toHaveLength(1);
    expect(next.turns[0].hostAmount).toBe(20);
  });

  it("leaves players without a pick untouched", () => {
    const g = game();
    const [ann] = idsOf(g);
    const next = settlePokdengTurn(g, {
      [ann]: { outcome: "win", multiplier: 1 },
    });
    expect(next.players[1].credit).toBe(0);
    expect(next.turns[0].results).toHaveLength(1);
  });

  it("returns the game unchanged when nobody was picked", () => {
    const g = game();
    expect(settlePokdengTurn(g, {})).toBe(g);
  });

  it("skips a paused seat even if a stale pick lingers for it", () => {
    const g = game();
    const [ann, ben] = idsOf(g);
    const paused = setPokdengPlayerStatus(g, ben, "paused");
    const next = settlePokdengTurn(paused, {
      [ann]: { outcome: "win", multiplier: 1 },
      [ben]: { outcome: "win", multiplier: 1 },
    });
    expect(next.players[1].credit).toBe(0);
    expect(next.turns[0].results.map((r) => r.playerId)).toEqual([ann]);
  });
});

describe("undoPokdengTurn", () => {
  it("rolls the last turn back off the balances", () => {
    const g = game();
    const [ann, ben] = idsOf(g);
    const settled = settlePokdengTurn(g, {
      [ann]: { outcome: "win", multiplier: 1 },
      [ben]: { outcome: "lose", multiplier: 1 },
    });

    const undone = undoPokdengTurn(settled);

    expect(undone.players.map((p) => p.credit)).toEqual([0, 0]);
    expect(undone.turns).toHaveLength(0);
    expect(undone.turnCount).toBe(0);
  });

  it("is a no-op with no history", () => {
    const g = game();
    expect(undoPokdengTurn(g)).toBe(g);
  });
});

describe("resetPokdengCredits", () => {
  it("zeroes balances and history but keeps the table seated", () => {
    const g = game();
    const [ann] = idsOf(g);
    const settled = settlePokdengTurn(g, {
      [ann]: { outcome: "win", multiplier: 3 },
    });

    const reset = resetPokdengCredits(settled);

    expect(reset.players.map((p) => p.credit)).toEqual([0, 0]);
    expect(reset.players.map((p) => p.name)).toEqual(["Ann", "Ben"]);
    expect(reset.turns).toHaveLength(0);
    expect(reset.turnCount).toBe(0);
  });
});

describe("isPokdengPlayerActive", () => {
  it("treats a game saved before statuses existed as active", () => {
    expect(isPokdengPlayerActive({ id: "a", name: "Ann", credit: 0 })).toBe(
      true,
    );
  });
});
