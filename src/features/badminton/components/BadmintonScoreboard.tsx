"use client";

import { Team } from "@/features/badminton/model/badminton";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
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
  const [mode, setMode] = useState<"standard" | "freehand">("standard");
  const [scoreSize, setScoreSize] = useState(1);
  const scoreSizeClasses = [
    "text-3xl sm:text-4xl",
    "text-4xl sm:text-5xl",
    "text-5xl sm:text-6xl",
    "text-6xl sm:text-7xl",
  ] as const;
  const [games, setGames] = useState<Score[]>([]);
  const [points, setPoints] = useState<Score>([0, 0]);
  const [undo, setUndo] = useState<{ games: Score[]; points: Score }[]>([]);
  const wins = [0, 1].map(
    (side) => games.filter((game) => winnerOf(game) === side).length,
  );
  const matchWinner = wins.findIndex((count) => count === 2);
  const completed = matchWinner !== -1;

  const changeFreehandPoint = (side: number, delta: number) => {
    setPoints((current) => {
      const next: Score = [...current] as Score;
      next[side] = Math.max(0, next[side] + delta);
      return next;
    });
  };

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
    <Card
      className="border border-default-200/70 bg-content1/90 shadow-sm"
      aria-label={t("badminton.scoreboard")}
    >
      <CardHeader className="flex items-center justify-between gap-2 pb-2">
        <h4 className="text-sm font-semibold">{t("badminton.scoreboard")}</h4>
        {mode === "standard" && (
          <span className="text-xs text-default-500">
            {t("badminton.gameNumber", {
              number: Math.min(games.length + 1, 3),
            })}
          </span>
        )}
      </CardHeader>
      <CardBody className="space-y-4 pt-0">
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-xs font-medium text-default-500">
            {t("badminton.scoreSize")}
          </span>
          <Button
            isIconOnly
            size="sm"
            radius="lg"
            variant="flat"
            isDisabled={scoreSize === 0}
            onPress={() => setScoreSize((current) => Math.max(0, current - 1))}
            aria-label={t("badminton.decreaseScoreSize")}
          >
            A−
          </Button>
          <Button
            isIconOnly
            size="sm"
            radius="lg"
            variant="flat"
            isDisabled={scoreSize === scoreSizeClasses.length - 1}
            onPress={() =>
              setScoreSize((current) =>
                Math.min(scoreSizeClasses.length - 1, current + 1),
              )
            }
            aria-label={t("badminton.increaseScoreSize")}
          >
            A+
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-default-100 p-1">
          {(["standard", "freehand"] as const).map((value) => (
            <Button
              key={value}
              variant={mode === value ? "solid" : "light"}
              color={mode === value ? "primary" : "default"}
              onPress={() => {
                setMode(value);
                setPoints([0, 0]);
                setGames([]);
                setUndo([]);
              }}
              aria-pressed={mode === value}
            >
              {t(`badminton.scoreMode${value}`)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {teams.map((team, side) => (
            <div
              key={side}
              className={`rounded-2xl border p-3 text-center ${
                mode === "standard" && matchWinner === side
                  ? "border-success bg-success/10"
                  : "border-default-200 bg-default-100/60"
              }`}
            >
              <p className="min-h-10 break-words text-sm font-semibold">
                {team.map((player) => player.name).join(" / ")}
              </p>
              {mode === "standard" && (
                <p className="text-xs text-default-500">
                  {t("badminton.gamesWon", { count: wins[side] })}
                </p>
              )}
              <p
                className={`my-2 font-bold leading-none tabular-nums ${scoreSizeClasses[scoreSize]}`}
              >
                {mode === "standard" && completed ? "–" : points[side]}
              </p>
              <div className="flex gap-2">
                {mode === "freehand" && (
                  <Button
                    color="default"
                    variant="flat"
                    className="min-w-0 flex-1"
                    isDisabled={points[side] === 0}
                    onPress={() => changeFreehandPoint(side, -1)}
                    aria-label={t("badminton.removePointFor", {
                      name: team.map((player) => player.name).join(" / "),
                    })}
                  >
                    −1
                  </Button>
                )}
                <Button
                  color="primary"
                  variant="flat"
                  className="min-w-0 flex-1"
                  isDisabled={mode === "standard" && completed}
                  onPress={() =>
                    mode === "freehand"
                      ? changeFreehandPoint(side, 1)
                      : addPoint(side)
                  }
                  aria-label={t("badminton.addPointFor", {
                    name: team.map((player) => player.name).join(" / "),
                  })}
                >
                  +1
                </Button>
              </div>
            </div>
          ))}
        </div>
        {mode === "standard" && games.length > 0 && (
          <p className="text-center text-xs text-default-500">
            {games.map((game) => game.join("–")).join(" · ")}
          </p>
        )}
        {mode === "standard" && completed && (
          <p role="status" className="text-center font-semibold text-success">
            {t("badminton.matchWinner", {
              name: teams[matchWinner].map((player) => player.name).join(" / "),
            })}
          </p>
        )}
        <div className="flex gap-2">
          {mode === "standard" && (
            <Button
              size="sm"
              variant="flat"
              isDisabled={!undo.length}
              onPress={restore}
            >
              {t("badminton.undoScore")}
            </Button>
          )}
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={() => {
              setGames([]);
              setPoints([0, 0]);
              setUndo([]);
            }}
          >
            {t("badminton.resetScore")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default BadmintonScoreboard;
