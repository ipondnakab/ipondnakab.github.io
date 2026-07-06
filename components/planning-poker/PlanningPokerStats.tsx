"use client";

import { PLANNING_POKER_ADMIN_PARAM } from "@/constants/planning-poker";
import { RoomData, RoomStats } from "@/interfaces/poker";
import { Card, Chip } from "@nextui-org/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export interface PlanningPokerStatsProps {
  roomData: RoomData | null;
  stats: RoomStats | null;
  roomId: string | null;
}

const PlanningPokerStats: React.FC<PlanningPokerStatsProps> = ({
  roomData,
  stats,
  roomId,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Strip the admin secret so a shared link can't grant admin to others.
    const url = new URL(window.location.href);
    url.searchParams.delete(PLANNING_POKER_ADMIN_PARAM);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Card
      isBlurred
      className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 shadow-sm"
    >
      <div className="flex flex-col items-center border-r border-default-100">
        <span className="font-bold uppercase tracking-widest text-default-400">
          {t("poker.average")}
        </span>
        <span className="text-2xl font-black text-primary">
          {roomData?.revealed ? stats?.avg : "?"}
        </span>
        <span className="text-[10px] text-default-400 mt-1">
          {t("poker.averageHint")}
        </span>
      </div>
      <div className="flex flex-col items-center md:border-r border-default-100">
        <span className="font-bold uppercase tracking-widest text-default-400">
          {t("poker.votes")}
        </span>
        <span className="text-2xl font-black">
          {stats?.total} / {Object.keys(roomData?.votes || {}).length}
        </span>
        <span className="text-[10px] text-default-400 mt-1">
          {t("poker.votesHint", {
            percent: (
              ((stats?.total || 0) /
                (Object.keys(roomData?.votes || {}).length || 1)) *
              100
            ).toFixed(0),
          })}
        </span>
      </div>
      <div className="flex flex-col items-center border-r border-default-100">
        <span className="font-bold uppercase tracking-widest text-default-400">
          {t("poker.status")}
        </span>
        <Chip
          size="sm"
          variant="flat"
          color={roomData?.revealed ? "success" : "warning"}
          className="mt-1 font-bold tracking-tighter"
        >
          {roomData?.revealed ? t("poker.revealed") : t("poker.voting")}
        </Chip>
        <span className="text-[10px] text-default-400 mt-1">
          {roomData?.revealed
            ? t("poker.statusRevealedHint")
            : t("poker.statusVotingHint")}
        </span>
      </div>
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={handleCopy}
      >
        <span className="font-bold uppercase tracking-widest text-primary">
          {t("poker.roomId")}
        </span>
        <span className="text-sm font-bold mt-1 uppercase">{roomId}</span>
        <span
          className={`text-[10px] mt-1 transition-colors duration-300 ${copied ? "text-success" : "text-default-400"}`}
        >
          {copied ? t("poker.copied") : t("poker.copyLink")}
        </span>
      </div>
    </Card>
  );
};

export default PlanningPokerStats;
