"use client";

import { RoomData, RoomStats } from "@/interfaces/poker";
import { Card, Chip } from "@nextui-org/react";
import React, { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
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
          Average
        </span>
        <span className="text-2xl font-black text-primary">
          {roomData?.revealed ? stats?.avg : "?"}
        </span>
        <span className="text-[10px] text-default-400 mt-1">
          Based on revealed votes
        </span>
      </div>
      <div className="flex flex-col items-center md:border-r border-default-100">
        <span className="font-bold uppercase tracking-widest text-default-400">
          Votes
        </span>
        <span className="text-2xl font-black">
          {stats?.total} / {Object.keys(roomData?.votes || {}).length}
        </span>
        <span className="text-[10px] text-default-400 mt-1">
          Total votes cast{" "}
          {`(${(((stats?.total || 0) / (Object.keys(roomData?.votes || {}).length || 1)) * 100).toFixed(0)}%)`}
        </span>
      </div>
      <div className="flex flex-col items-center border-r border-default-100">
        <span className="font-bold uppercase tracking-widest text-default-400">
          Status
        </span>
        <Chip
          size="sm"
          variant="flat"
          color={roomData?.revealed ? "success" : "warning"}
          className="mt-1 font-bold tracking-tighter"
        >
          {roomData?.revealed ? "REVEALED" : "VOTING"}
        </Chip>
        <span className="text-[10px] text-default-400 mt-1">
          {roomData?.revealed
            ? "Votes are visible to everyone"
            : "Votes are hidden until reveal"}
        </span>
      </div>
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={handleCopy}
      >
        <span className="font-bold uppercase tracking-widest text-primary">
          Room ID
        </span>
        <span className="text-sm font-bold mt-1 uppercase">{roomId}</span>
        <span
          className={`text-[10px] mt-1 transition-colors duration-300 ${copied ? "text-success" : "text-default-400"}`}
        >
          {copied ? "Copied!" : "Click to copy link"}
        </span>
      </div>
    </Card>
  );
};

export default PlanningPokerStats;
