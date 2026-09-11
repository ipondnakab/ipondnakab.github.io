"use client";

import { Team } from "@/features/badminton/model/badminton";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmarkCircle, IoPersonOutline } from "react-icons/io5";

export interface BadmintonMatchCardProps {
  teams: Team[];
  number: number;
  winner?: number | null;
  onSelectWinner?: (side: number) => void;
}

const BadmintonMatchCard: React.FC<BadmintonMatchCardProps> = ({
  teams,
  number,
  winner,
  onSelectWinner,
}) => {
  const { t } = useTranslation();
  return (
    <article className="overflow-hidden rounded-3xl border border-default-200/70 bg-content1/90 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-default-200/60 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-default-600">
          {t("badminton.match", { number })}
        </h3>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
      <div className="relative grid grid-cols-2 gap-3 p-3 sm:gap-5 sm:p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-4 left-1/2 border-l border-dashed border-default-300"
        />
        {teams.map((team, side) => {
          const selected = winner === side;
          const content = (
            <>
              <span
                className={`mb-3 flex items-center justify-between gap-1 text-xs font-semibold ${selected ? "text-success-600" : "text-default-500"}`}
              >
                {t(
                  team.length === 1
                    ? "badminton.playerNumber"
                    : "badminton.teamNumber",
                  { number: side + 1 },
                )}
                {selected && (
                  <IoCheckmarkCircle
                    aria-hidden
                    className="shrink-0 text-base"
                  />
                )}
              </span>
              <span className="flex flex-col gap-3">
                {team.map((player) => (
                  <span
                    key={player.id}
                    className="flex min-w-0 items-start gap-2"
                  >
                    <IoPersonOutline
                      aria-hidden
                      className="mt-1 hidden shrink-0 text-default-400 sm:block"
                    />
                    <span className="min-w-0 break-words text-sm font-semibold leading-relaxed sm:text-base">
                      {player.name}
                    </span>
                  </span>
                ))}
              </span>
            </>
          );
          const className = `relative min-w-0 rounded-2xl border p-3 text-left sm:p-4 ${selected ? "border-success/50 bg-success/10" : "border-default-200/60 bg-default-100/60"}`;
          return onSelectWinner ? (
            <button
              key={side}
              type="button"
              aria-pressed={selected}
              aria-label={t("badminton.selectWinner", {
                name: team.map((p) => p.name).join(" / "),
              })}
              onClick={() => onSelectWinner(side)}
              className={`${className} min-h-24 hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
            >
              {content}
            </button>
          ) : (
            <div key={side} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </article>
  );
};
export default BadmintonMatchCard;
