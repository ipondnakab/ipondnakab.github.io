"use client";

import { Card, Chip, cn } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { IoRibbon } from "react-icons/io5";

import { formatPokdengCredit } from "@/functions/pokdeng-credit";

export interface PokdengHostCardProps {
  hostName: string;
  hostCredit: number;
  pendingHostAmount: number;
}

const PokdengHostCard: React.FC<PokdengHostCardProps> = ({
  hostName,
  hostCredit,
  pendingHostAmount,
}) => {
  const { t } = useTranslation();
  return (
    <Card isBlurred className="gap-1 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Chip
            size="sm"
            variant="flat"
            color="warning"
            startContent={<IoRibbon className="ml-1" />}
            className="font-bold"
          >
            {t("pokdeng.host")}
          </Chip>
          <span className="truncate font-bold uppercase">{hostName}</span>
        </div>
        <div className="flex shrink-0 items-baseline gap-2">
          <span
            className={cn("text-2xl font-black tabular-nums", {
              "text-success": hostCredit > 0,
              "text-danger": hostCredit < 0,
              "text-default-400": hostCredit === 0,
            })}
          >
            {formatPokdengCredit(hostCredit)}
          </span>
          {pendingHostAmount !== 0 && (
            <Chip
              size="sm"
              variant="flat"
              color={pendingHostAmount > 0 ? "success" : "danger"}
              className="font-bold tabular-nums"
            >
              {formatPokdengCredit(pendingHostAmount)}
            </Chip>
          )}
        </div>
      </div>
      {/* The host's balance is derived from the players', so the table always
          nets to zero — surfaced here as the settle-up check at the end. */}
      <span className="hidden text-[10px] text-default-400 sm:block">
        {t("pokdeng.hostHint")}
      </span>
    </Card>
  );
};

export default PokdengHostCard;
