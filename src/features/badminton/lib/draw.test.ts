import {
  createCompetition,
  randomMatches,
  standings,
} from "@/features/badminton/lib/draw";
import { Player } from "@/features/badminton/model/badminton";
import { describe, expect, it } from "vitest";
const players = (count: number): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i),
    name: `Player ${i}`,
    gender: i % 2 ? "female" : "male",
  }));
describe("badminton draws", () => {
  it("creates singles matches with one sit-out for an odd roster", () => {
    const roster = players(5);
    const draw = randomMatches(roster, "mixed", () => 0.3, [], "singles");
    expect(draw.format).toBe("singles");
    expect(draw.matches).toHaveLength(2);
    expect(draw.matches.flat().every((team) => team.length === 1)).toBe(true);
    expect(draw.waiting).toHaveLength(1);
    expect(
      new Set([...draw.matches.flat(2), ...draw.waiting].map((p) => p.id)).size,
    ).toBe(5);
    expect(roster).toEqual(players(5));
    expect(
      randomMatches(players(2), "any", () => 0.3, [], "singles").matches,
    ).toHaveLength(1);
  });
  it("avoids repeat singles opponents until all opponents have been drawn", () => {
    const history: ReturnType<typeof randomMatches>[] = [];
    const opponents = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const draw = randomMatches(
        players(4),
        "any",
        () => 0.3,
        history,
        "singles",
      );
      for (const match of draw.matches) {
        const key = match
          .flat()
          .map((p) => p.id)
          .sort()
          .join(",");
        expect(opponents.has(key)).toBe(false);
        opponents.add(key);
      }
      history.push(draw);
    }
    expect(opponents.size).toBe(6);
    expect(
      randomMatches(players(4), "any", () => 0.3, history, "singles").matches,
    ).toHaveLength(2);
  });
  it("keeps singles opponent costs separate from doubles partner costs", () => {
    const singles = randomMatches(players(4), "any", () => 0.3, [], "singles");
    const doubles = randomMatches(players(4), "any", () => 0.3);
    expect(
      randomMatches(players(4), "any", () => 0.3, [doubles], "singles"),
    ).toEqual(singles);
    expect(randomMatches(players(4), "any", () => 0.3, [singles])).toEqual(
      doubles,
    );
  });
  it("uses all three distinct partnerships for four players before repeating", () => {
    const history: ReturnType<typeof randomMatches>[] = [];
    const pairs = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const draw = randomMatches(players(4), "any", () => 0.3, history);
      for (const team of draw.matches.flat()) {
        const key = team
          .map((p) => p.id)
          .sort()
          .join(",");
        expect(pairs.has(key)).toBe(false);
        pairs.add(key);
      }
      history.push(draw);
    }
    expect(
      randomMatches(players(4), "any", () => 0.3, history).matches,
    ).toHaveLength(1);
  });
  it("keeps mixed preference while avoiding previous mixed partners", () => {
    const first = randomMatches(players(4), "mixed", () => 0.3);
    const next = randomMatches(players(4), "mixed", () => 0.3, [first]);
    const previous = first.matches.flat().map((team) =>
      team
        .map((p) => p.id)
        .sort()
        .join(","),
    );
    for (const team of next.matches.flat()) {
      expect(team[0].gender).not.toBe(team[1].gender);
      expect(previous).not.toContain(
        team
          .map((p) => p.id)
          .sort()
          .join(","),
      );
    }
  });
  it("uses everyone exactly once and reports sit-outs without mutating the roster", () => {
    const roster = players(11);
    const result = randomMatches(roster, "any", () => 0.3);
    const ids = [...result.matches.flat(2), ...result.waiting].map((p) => p.id);
    expect(result.matches).toHaveLength(2);
    expect(result.waiting).toHaveLength(3);
    expect(new Set(ids).size).toBe(11);
    expect(roster).toEqual(players(11));
  });
  it("respects mixed and same gender pairing and reports unmatched players", () => {
    for (const pairing of ["mixed", "same"] as const) {
      const result = randomMatches(players(11), pairing);
      for (const team of result.matches.flat())
        expect(team[0].gender === team[1].gender).toBe(pairing === "same");
      expect(
        new Set([...result.matches.flat(2), ...result.waiting].map((p) => p.id))
          .size,
      ).toBe(11);
    }
  });
  it("rejects competition rosters that would exclude someone", () => {
    expect(() => createCompetition(players(1), "singles", "any")).toThrow();
    expect(() => createCompetition(players(5), "doubles", "any")).toThrow();
  });
  it("prefers the selected gender rule then pairs leftovers in both modes", () => {
    const roster = players(8).map((p, i) => ({
      ...p,
      gender: i < 5 ? ("male" as const) : ("female" as const),
    }));
    for (const pairing of ["mixed", "same"] as const) {
      const result = randomMatches(roster, pairing, () => 0.3);
      expect(result.matches).toHaveLength(2);
      expect(result.waiting).toHaveLength(0);
      const teams = result.matches.flat();
      expect(
        teams.filter((team) =>
          pairing === "mixed"
            ? team[0].gender !== team[1].gender
            : team[0].gender === team[1].gender,
        ),
      ).toHaveLength(3);
      expect(new Set(teams.flat().map((p) => p.id)).size).toBe(8);
      const rounds = createCompetition(roster, "doubles", pairing);
      expect(rounds.flat()).toHaveLength(6);
      expect(standings(rounds)).toHaveLength(4);
    }
  });
  it("falls back when no mixed pair is possible, including unspecified genders", () => {
    const roster = players(5).map((p) => ({ ...p, gender: "other" as const }));
    const draw = randomMatches(roster, "mixed");
    expect(draw.matches).toHaveLength(1);
    expect(draw.waiting).toHaveLength(1);
    expect(
      new Set([...draw.matches.flat(2), ...draw.waiting].map((p) => p.id)).size,
    ).toBe(5);
    expect(
      createCompetition(roster.slice(0, 4), "doubles", "mixed").flat(),
    ).toHaveLength(1);
  });
  it("schedules every singles opponent once with no simultaneous duplicate players", () => {
    for (const count of [2, 3, 4, 5, 8]) {
      const rounds = createCompetition(players(count), "singles", "any");
      expect(rounds.flat()).toHaveLength((count * (count - 1)) / 2);
      const pairs = rounds.flat().map((m) =>
        m.teams
          .flat()
          .map((p) => p.id)
          .sort()
          .join(","),
      );
      expect(new Set(pairs).size).toBe(pairs.length);
      for (const round of rounds) {
        const ids = round.flatMap((m) => m.teams.flat().map((p) => p.id));
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });
  it("keeps doubles partners fixed and derives standings from recorded results", () => {
    const rounds = createCompetition(players(8), "doubles", "mixed");
    expect(rounds.flat()).toHaveLength(6);
    expect(
      new Set(
        rounds.flatMap((r) =>
          r.flatMap((m) => m.teams.map((t) => t.map((p) => p.id).join(","))),
        ),
      ).size,
    ).toBe(4);
    rounds[0][0].winner = 0;
    const table = standings(rounds);
    expect(table[0].wins).toBe(1);
    expect(table.reduce((sum, row) => sum + row.played, 0)).toBe(2);
    rounds[0][0].winner = null;
    expect(standings(rounds).every((row) => row.played === 0)).toBe(true);
  });
});
