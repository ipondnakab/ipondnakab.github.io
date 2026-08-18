"use client";

import { Button, Card, cn } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  IoEnterOutline,
  IoExitOutline,
  IoPauseOutline,
  IoPencil,
  IoPlayOutline,
} from "react-icons/io5";

import { POKDENG_MULTIPLIERS } from "@/features/pokdeng/constants";
import {
  formatPokdengCredit,
  isPokdengPlayerActive,
  pokdengPickAmount,
} from "@/features/pokdeng/lib/credit";
import {
  PokdengOutcome,
  PokdengPlayer,
  PokdengPlayerStatus,
} from "@/features/pokdeng/model/pokdeng";

export interface PokdengPlayerCardProps {
  player: PokdengPlayer;
  bet: number;
  // Absent until the player is put on a side; the deng stands on its own so it
  // can be set before (or without) an outcome.
  outcome?: PokdengOutcome;
  multiplier: number;
  onPickOutcome: (playerId: string, outcome: PokdengOutcome) => void;
  onPickMultiplier: (playerId: string, multiplier: number) => void;
  onSetStatus: (playerId: string, status: PokdengPlayerStatus) => void;
  onEdit: (playerId: string) => void;
}

const PokdengPlayerCard: React.FC<PokdengPlayerCardProps> = ({
  player,
  bet,
  outcome,
  multiplier,
  onPickOutcome,
  onPickMultiplier,
  onSetStatus,
  onEdit,
}) => {
  const { t } = useTranslation();
  const isActive = isPokdengPlayerActive(player);
  const hasLeft = player.status === "left";
  // What this turn will do to the player once settled, shown live so the host
  // can sanity-check the table before committing.
  const pendingAmount =
    outcome && isActive ? pokdengPickAmount(bet, outcome, multiplier) : 0;

  return (
    <Card
      isBlurred
      className={cn(
        // Every seat reads as a card; the picked side just recolours its edge.
        "gap-1.5 border-2 p-2 shadow-sm transition-colors",
        outcome === "win" && isActive
          ? "border-success"
          : outcome === "lose" && isActive
            ? "border-danger"
            : "border-default-200",
        // A seat that is out of play recedes rather than disappears — its
        // balance still counts, so it has to stay readable.
        { "opacity-60": !isActive },
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          className="group flex min-w-0 flex-1 items-center gap-1 text-left"
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
        {/* Negative margin keeps the padded hit areas from growing the card:
            the icons stay small, the tap targets do not. */}
        <div className="-my-1 -mr-1 flex shrink-0 items-center">
          {/* Pause is hidden once a player has left: they are done, and
              "rejoin" is the only way back in. */}
          {!hasLeft && (
            <button
              type="button"
              className="p-1.5 text-default-400 transition-colors hover:text-warning"
              aria-label={
                isActive
                  ? t("pokdeng.pausePlayer", { name: player.name })
                  : t("pokdeng.resumePlayer", { name: player.name })
              }
              title={isActive ? t("pokdeng.pause") : t("pokdeng.resume")}
              onClick={() =>
                onSetStatus(player.id, isActive ? "paused" : "active")
              }
            >
              {isActive ? (
                <IoPauseOutline size={13} />
              ) : (
                <IoPlayOutline size={13} />
              )}
            </button>
          )}
          <button
            type="button"
            className="p-1.5 text-default-400 transition-colors hover:text-danger"
            aria-label={
              hasLeft
                ? t("pokdeng.rejoinPlayer", { name: player.name })
                : t("pokdeng.leavePlayer", { name: player.name })
            }
            title={hasLeft ? t("pokdeng.rejoin") : t("pokdeng.leave")}
            onClick={() => onSetStatus(player.id, hasLeft ? "active" : "left")}
          >
            {hasLeft ? (
              <IoEnterOutline size={13} />
            ) : (
              <IoExitOutline size={13} />
            )}
          </button>
        </div>
      </div>

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
        {outcome && isActive && (
          <span
            className={cn("text-[11px] font-bold tabular-nums", {
              "text-success": pendingAmount >= 0,
              "text-danger": pendingAmount < 0,
            })}
          >
            {formatPokdengCredit(pendingAmount)}
          </span>
        )}
        {!isActive && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-default-400">
            {hasLeft ? t("pokdeng.statusLeft") : t("pokdeng.statusPaused")}
          </span>
        )}
      </div>

      {/* A player who has left is done for the session — the controls go away
          and only their final balance remains. Pausing keeps them in view but
          out of play, so the controls stay put and simply go dead. */}
      {!hasLeft && (
        <>
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              radius="sm"
              className="h-7 min-w-0 px-0 text-[11px] font-bold"
              color="success"
              isDisabled={!isActive}
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
              isDisabled={!isActive}
              variant={outcome === "lose" ? "solid" : "bordered"}
              onPress={() => onPickOutcome(player.id, "lose")}
            >
              {t("pokdeng.lose")}
            </Button>
          </div>

          {/* Always on show: the deng can be set before a side is picked, and
              every card keeps the same height either way. The deng's name is
              too long for the button, so it rides on the label instead. */}
          <div className="grid grid-cols-4 gap-1">
            {POKDENG_MULTIPLIERS.map((option) => {
              const isSelected = multiplier === option.value;
              return (
                <Button
                  key={option.value}
                  size="sm"
                  radius="sm"
                  isDisabled={!isActive}
                  variant={isSelected ? "solid" : "flat"}
                  // The active deng takes the outcome's colour so a card never
                  // mixes a green WIN with a red-looking selection. With no
                  // side picked it stays neutral — nothing is won or lost yet.
                  color={
                    isSelected && outcome
                      ? outcome === "win"
                        ? "success"
                        : "danger"
                      : "default"
                  }
                  className={cn(
                    "h-6 min-w-0 px-0 text-[10px] font-bold tabular-nums",
                    { "opacity-60": !outcome && !isSelected },
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
        </>
      )}
    </Card>
  );
};

export default PokdengPlayerCard;
