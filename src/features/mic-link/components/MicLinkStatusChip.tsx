"use client";

import { Chip } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MicLinkStatus } from "@/features/mic-link/model/mic-link";

type ChipColor = "default" | "primary" | "success" | "warning" | "danger";

const STATUS_COLORS: Record<MicLinkStatus, ChipColor> = {
  idle: "default",
  waiting: "warning",
  connecting: "warning",
  live: "success",
  closed: "default",
  error: "danger",
};

export interface MicLinkStatusChipProps {
  status: MicLinkStatus;
}

const MicLinkStatusChip: React.FC<MicLinkStatusChipProps> = ({ status }) => {
  const { t } = useTranslation();

  return (
    <Chip
      color={STATUS_COLORS[status]}
      variant={status === "live" ? "solid" : "flat"}
      size="sm"
      startContent={
        status === "live" ? (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-1" />
        ) : undefined
      }
    >
      {t(`micLink.status.${status}`)}
    </Chip>
  );
};

export default MicLinkStatusChip;
