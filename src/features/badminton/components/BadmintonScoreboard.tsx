"use client";

import { Team } from "@/features/badminton/model/badminton";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export interface BadmintonScoreboardProps {
  teams: Team[];
}

type Score = [number, number];
export const winnerOf = ([a, b]: Score): number | null => {
  if (a === 30 && a > b) return 0;
  if (b === 30 && b > a) return 1;
  if (a >= 21 && a - b >= 2) return 0;
  if (b >= 21 && b - a >= 2) return 1;
  return null;
};

const BadmintonScoreboard: React.FC<BadmintonScoreboardProps> = ({ teams }) => {
  const { t } = useTranslation();
  const [games, setGames] = useState<Score[]>([]);
  const [points, setPoints] = useState<Score>([0, 0]);
  const [undo, setUndo] = useState<{ games: Score[]; points: Score }[]>([]);
  const wins = [0, 1].map((side) =>
    games.filter((game) => winnerOf(game) === side).length,
  );
  const matchWinner = wins.findIndex((count) => count === 2);
  const completed = matchWinner !== -1;
  const addPoint = (side: number) => {
    if (completed) return;
    setUndo((history) => [...history, { games, points }]);
    const next: Score = [...points] as Score;
    next[side] += 1;
    if (winnerOf(next) !== null) {
      setGames((current) => [...current, next]);
      setPoints([0, 0]);
    } else setPoints(next);
  };
  const restore = () => {
    const previous = undo[undo.length - 1];
    if (!previous) return;
    setGames(previous.games);
    setPoints(previous.points);
    setUndo((history) => history.slice(0, -1));
  };
  return (
    <section className="space-y-3 border-t border-default-200/60 p-4" aria-label={t("badminton.scoreboard")}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{t("badminton.scoreboard")}</h4>
        <span className="text-xs text-default-500">{t("badminton.gameNumber", { number: Math.min(games.length + 1, 3) })}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {teams.map((team, side) => (
          <div key={side} className={`rounded-2xl border p-3 text-center ${matchWinner === side ? "border-success bg-success/10" : "border-default-200 bg-default-100/60"}`}>
            <p className="min-h-10 break-words text-sm font-semibold">{team.map((player) => player.name).join(" / ")}</p>
            <p className="text-xs text-default-500">{t("badminton.gamesWon", { count: wins[side] })}</p>
            <p className="my-2 text-4xl font-bold tabular-nums">{completed ? "–" : points[side]}</p>
            <Button color="primary" variant="flat" className="w-full" isDisabled={completed} onPress={() => addPoint(side)} aria-label={t("badminton.addPointFor", { name: team.map((player) => player.name).join(" / ") })}>+1</Button>
          </div>
        ))}
      </div>
      {games.length > 0 && <p className="text-center text-xs text-default-500">{games.map((game) => game.join("–")).join(" · ")}</p>}
      {completed && <p role="status" className="text-center font-semibold text-success">{t("badminton.matchWinner", { name: teams[matchWinner].map((player) => player.name).join(" / ") })}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="flat" isDisabled={!undo.length} onPress={restore}>{t("badminton.undoScore")}</Button>
        <Button size="sm" variant="light" color="danger" onPress={() => { setGames([]); setPoints([0, 0]); setUndo([]); }}>{t("badminton.resetScore")}</Button>
      </div>
    </section>
  );
};

export default BadmintonScoreboard;
