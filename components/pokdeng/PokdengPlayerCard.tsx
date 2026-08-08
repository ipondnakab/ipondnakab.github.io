"use client";

import { Button, Card, cn } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoPencil } from "react-icons/io5";

import { POKDENG_MULTIPLIERS } from "@/constants/pokdeng";
import {
  formatPokdengCredit,
  pokdengPickAmount,
} from "@/functions/pokdeng-credit";
import { PokdengOutcome, PokdengPlayer } from "@/interfaces/pokdeng";

export interface PokdengPlayerCardProps {
  player: PokdengPlayer;
  bet: number;
  // Absent until the player is put on a side; the deng stands on its own so it
  // can be set before (or without) an outcome.
  outcome?: PokdengOutcome;
  multiplier: number;
  onPickOutcome: (playerId: string, outcome: PokdengOutcome) => void;
  onPickMultiplier: (playerId: string, multiplier: number) => void;
  onEdit: (playerId: string) => void;
}

const PokdengPlayerCard: React.FC<PokdengPlayerCardProps> = ({
  player,
  bet,
  outcome,
  multiplier,
  onPickOutcome,
  onPickMultiplier,
  onEdit,
}) => {
  const { t } = useTranslation();
  // What this turn will do to the player once settled, shown live so the host
  // can sanity-check the table before committing.
  const pendingAmount = outcome
    ? pokdengPickAmount(bet, outcome, multiplier)
    : 0;

  return (
    <Card
      isBlurred
      className={cn(
        // Every seat reads as a card; the picked side just recolours its edge.
        "gap-1.5 border-2 p-2 shadow-sm transition-colors",
        outcome === "win"
          ? "border-success"
          : outcome === "lose"
            ? "border-danger"
            : "border-default-200",
      )}
    >
      <button
        type="button"
        className="group flex min-w-0 items-center gap-1 text-left"
        aria-label={t("pokdeng.editPlayer", { name: player.name })}
        onClick={() => onEdit(player.id)}
      >
        <span className="truncate text-[11px] font-bold uppercase">
          {player.name}
        </span>
        <IoPencil
          size={10}
          className="shrink-0 text-default-400 transition-colors group-hover:text-primary"
        />
      </button>

      <div className="flex items-baseline justify-between gap-1">
        <span
          className={cn("text-lg font-black leading-none tabular-nums", {
            "text-success": player.credit > 0,
            "text-danger": player.credit < 0,
            "text-default-400": player.credit === 0,
          })}
        >
          {formatPokdengCredit(player.credit)}
        </span>
        {outcome && (
          <span
            className={cn("text-[11px] font-bold tabular-nums", {
              "text-success": pendingAmount >= 0,
              "text-danger": pendingAmount < 0,
            })}
          >
            {formatPokdengCredit(pendingAmount)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Button
          size="sm"
          radius="sm"
          className="h-7 min-w-0 px-0 text-[11px] font-bold"
          color="success"
          variant={outcome === "win" ? "solid" : "bordered"}
          onPress={() => onPickOutcome(player.id, "win")}
        >
          {t("pokdeng.win")}
        </Button>
        <Button
          size="sm"
          radius="sm"
          className="h-7 min-w-0 px-0 text-[11px] font-bold"
          color="danger"
          variant={outcome === "lose" ? "solid" : "bordered"}
          onPress={() => onPickOutcome(player.id, "lose")}
        >
          {t("pokdeng.lose")}
        </Button>
      </div>

      {/* Always on show: the deng can be set before a side is picked, and every
          card keeps the same height either way. The deng's name is too long for
          the button, so it rides on the label instead. */}
      <div className="grid grid-cols-4 gap-1">
        {POKDENG_MULTIPLIERS.map((option) => {
          const isActive = multiplier === option.value;
          return (
            <Button
              key={option.value}
              size="sm"
              radius="sm"
              variant={isActive ? "solid" : "flat"}
              // The active deng takes the outcome's colour so a card never
              // mixes a green WIN with a red-looking selection. With no side
              // picked yet it stays neutral — nothing is being won or lost.
              color={
                isActive && outcome
                  ? outcome === "win"
                    ? "success"
                    : "danger"
                  : "default"
              }
              className={cn(
                "h-6 min-w-0 px-0 text-[10px] font-bold tabular-nums",
                { "opacity-60": !outcome && !isActive },
              )}
              aria-label={t("pokdeng.multiplierAria", {
                value: option.value,
                label: t(option.labelKey),
              })}
              title={t(option.labelKey)}
              onPress={() => onPickMultiplier(player.id, option.value)}
            >
              x{option.value}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default PokdengPlayerCard;
