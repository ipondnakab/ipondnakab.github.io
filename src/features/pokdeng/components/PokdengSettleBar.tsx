"use client";

import { Button, Card, Chip, cn } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmarkDone, IoCloseOutline } from "react-icons/io5";

import { formatPokdengCredit } from "@/functions/pokdeng-credit";
import { PokdengOutcome } from "@/interfaces/pokdeng";

export interface PokdengSettleBarProps {
  pickCount: number;
  pendingHostAmount: number;
  onPickAll: (outcome: PokdengOutcome) => void;
  onClearPicks: () => void;
  onSettle: () => void;
}

const PokdengSettleBar: React.FC<PokdengSettleBarProps> = ({
  pickCount,
  pendingHostAmount,
  onPickAll,
  onClearPicks,
  onSettle,
}) => {
  const { t } = useTranslation();
  const hasPicks = pickCount > 0;

  return (
    <Card
      isBlurred
      className="sticky bottom-2 z-20 flex flex-col gap-2 p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* One tap for the common cases: the host sweeps the table, or busts
            against everyone. Individual rows can still be corrected after. */}
        <Button
          size="sm"
          variant="bordered"
          color="success"
          className="font-bold"
          onPress={() => onPickAll("win")}
        >
          {t("pokdeng.allWin")}
        </Button>
        <Button
          size="sm"
          variant="bordered"
          color="danger"
          className="font-bold"
          onPress={() => onPickAll("lose")}
        >
          {t("pokdeng.allLose")}
        </Button>
        <Button
          size="sm"
          variant="light"
          isDisabled={!hasPicks}
          startContent={<IoCloseOutline />}
          onPress={onClearPicks}
        >
          {t("pokdeng.clearPicks")}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-1 text-xs text-default-500">
          <span>{t("pokdeng.hostShort")}</span>
          <Chip
            size="sm"
            variant="flat"
            color={
              pendingHostAmount > 0
                ? "success"
                : pendingHostAmount < 0
                  ? "danger"
                  : "default"
            }
            className={cn("font-bold tabular-nums")}
          >
            {formatPokdengCredit(pendingHostAmount)}
          </Chip>
        </div>
        <Button
          color="primary"
          className="font-bold"
          isDisabled={!hasPicks}
          startContent={<IoCheckmarkDone />}
          onPress={onSettle}
        >
          {t("pokdeng.settleTurn", { num: pickCount })}
        </Button>
      </div>
    </Card>
  );
};

export default PokdengSettleBar;
